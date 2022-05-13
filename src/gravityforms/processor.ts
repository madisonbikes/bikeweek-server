import { Entry, Field } from "./types";
import { parse } from "date-fns";

import { reverseMapEventStatus } from "../database/events";
import { Configuration } from "../config";
import { locations } from "../locations";
import { injectable } from "tsyringe";
import { Database } from "../database/database";
import {
  BikeWeekEvent,
  EventLocation,
  EventSponsor,
  EventStatus,
  EventTime,
} from "../database/types";

/** this list is NOT exhaustive, just used for conditional behaviors in the backend */
export enum EventTypes {
  DISCOUNT = "discount",
  ENDOFWEEKPARTY = "endofweekparty",
  PAID = "paid",
  FREE = "free",
}

/** take data from mongo GF dump and load into structured event info */
@injectable()
export class Processor {
  constructor(
    private configuration: Configuration,
    private database: Database
  ) {}

  async extractEvents(): Promise<BikeWeekEvent[]> {
    const fields: Field[] = (await this.database.gfFormFields
      .find()
      .toArray()) as unknown as Field[];

    const responses: Entry[] = (await this.database.gfResponses
      .find()
      .toArray()) as unknown as Entry[];

    const eventHelper = new EventHelper(fields, this.configuration);

    const retval = Array<BikeWeekEvent>();
    for (const entry of responses) {
      const sponsors = eventHelper.getSponsorInfo(entry);
      const stringStatus = eventHelper.lookupFieldValue(entry, "status");
      const status =
        reverseMapEventStatus(stringStatus) ?? EventStatus.SUBMITTED;

      const newEntry: BikeWeekEvent = {
        id: entry.id.valueOf(),
        name: eventHelper.requireFieldValue(entry, "event_name"),
        eventUrl: eventHelper.lookupFieldValue(entry, "event_url"),
        description: eventHelper.requireFieldValue(entry, "event_description"),
        sponsors,
        location: eventHelper.getLocationInfo(entry),
        eventTypes: eventHelper.getEventTypes(entry),
        eventDays: eventHelper.getEventDays(entry),
        eventTimes: eventHelper.getEventTimes(entry),
        eventGraphicUrl: eventHelper.lookupFieldValue(entry, "event_graphic"),
        modifyDate: entry.date_updated,
        status,
      };
      // promote non-PAID and non-DISCOUNT items to FREE
      if (
        !newEntry.eventTypes.includes(EventTypes.PAID) &&
        !newEntry.eventTypes.includes(EventTypes.DISCOUNT) &&
        !newEntry.eventTypes.includes(EventTypes.FREE)
      ) {
        newEntry.eventTypes.push(EventTypes.FREE);
      }
      retval.push(newEntry);
    }
    return retval;
  }
}

class EventHelper {
  constructor(private fields: Field[], private configuration: Configuration) {}

  getLocationInfo(entry: Entry): EventLocation | undefined {
    const firstChoice = this.lookupFieldValue(entry, "location_first");
    let mapped = locations.find((value) => value.name == firstChoice);
    if (!mapped && firstChoice != "N/A" && firstChoice != "None") {
      console.log(
        `ERROR: Missing location map for location name: ${firstChoice}`
      );
    }
    if (mapped) {
      mapped = { ...mapped };
    } else {
      mapped = { name: "" };
    }
    mapped.detailed_location_description = this.lookupFieldValue(
      entry,
      "location_other"
    );
    return mapped;
  }

  getEventDays(entry: Entry): Date[] {
    const eventDays = this.requireMultiFieldValue(entry, "event_days");
    const retval = new Array<Date>();
    for (const day of eventDays) {
      const parsedDate = parse(day, "MM-dd-yyyy", new Date());
      if (Number.isNaN(parsedDate.getTime())) {
        throw Error(`Invalid date encountered ${day}`);
      }
      retval.push(parsedDate);
    }
    return retval;
  }

  getEventTypes(entry: Entry): string[] {
    return this.requireMultiFieldValue(entry, "event_type");
  }

  getEventTimes(entry: Entry): EventTime[] {
    const eventStart = this.lookupFieldValue(entry, "event_start");
    const eventEnd = this.lookupFieldValue(entry, "event_end");
    if (!eventEnd || !eventStart) {
      if (eventEnd || eventStart) {
        console.log(
          "Event has a mismatched start/end time. Event will be assumed to all-day."
        );
      }
      return [];
    } else {
      return [{ start: eventStart, end: eventEnd }];
    }
  }

  /** return parsed sponsor info from format like this "Madison Bikes (https://www.madisonbikes.org);City of Madison" */
  getSponsorInfo(entry: Entry): EventSponsor[] {
    const baseSponsorText = this.requireFieldValue(entry, "sponsors");
    let separator = ",";
    if (baseSponsorText.includes(";")) {
      separator = ";";
    }
    const sponsors = baseSponsorText.split(separator).map((v) => v.trim());
    const retval = new Array<EventSponsor>(sponsors.length);
    for (const ndx in sponsors) {
      const res = sponsors[ndx].match(/(.*)\((.+)\)/);
      if (!res) {
        retval[ndx] = { name: sponsors[ndx], url: "" };
      } else {
        retval[ndx] = { name: res[1].trim(), url: res[2].trim() };
      }
    }
    return retval;
  }

  requireFieldValue(entry: Entry, adminLabel: string): string {
    const fieldValue = this.lookupFieldValue(entry, adminLabel);
    if (!fieldValue) {
      throw new Error(`No entry for admin label ${adminLabel}`);
    }
    return fieldValue;
  }

  requireMultiFieldValue(entry: Entry, adminLabel: string): string[] {
    const fieldValue = this.lookupMultiFieldValue(entry, adminLabel);
    if (!fieldValue) {
      throw new Error(`No entry for admin label ${adminLabel}`);
    }
    return fieldValue;
  }

  lookupMultiFieldValue(
    entry: Entry,
    adminLabel: string
  ): string[] | undefined {
    const fieldId = this.lookupFieldId(adminLabel);
    if (!fieldId) return undefined;

    const inputs = this.fields
      .find((value) => value.id == fieldId)
      ?.inputs?.map((input) => input.id);
    if (!inputs) return undefined;

    const retval: string[] = [];
    for (const i of inputs) {
      const value = entry[i];
      if (typeof value === "string") {
        if (value && value.length > 0) {
          retval.push(value);
        }
      } else {
        console.log(
          `Unexpected non-string value in field ${adminLabel}: ${value}`
        );
      }
    }
    return retval;
  }

  lookupFieldValue(entry: Entry, adminLabel: string): string | undefined {
    const fieldId = this.lookupFieldId(adminLabel);
    if (!fieldId) return undefined;
    const value = entry[`${fieldId}`];
    if (typeof value !== "string") {
      console.log(
        `Unexpected non-string value in field ${adminLabel}: ${value}`
      );
      return undefined;
    }
    return value;
  }

  requireFieldId(adminLabel: string): number {
    const fieldId = this.lookupFieldId(adminLabel);
    if (!fieldId) {
      throw new Error(`No field for admin label ${adminLabel}`);
    }
    return fieldId;
  }

  lookupFieldId(adminLabel: string): number | undefined {
    return this.fields.find((value) => value.adminLabel == adminLabel)?.id;
  }
}
