import superagent from "superagent";

import { Entry, EntryResponse, FormResponse } from "./types";
import { parse } from "date-fns";

import {
  BikeWeekEvent,
  EventDay,
  EventStatus,
  EventTime,
  reverseMapEventStatus,
} from "../event_types";
import { injectable } from "tsyringe";
import { Configuration } from "../config";
import { EventLocation, locations } from "../locations";

@injectable()
export class Importer {
  constructor(private config: Configuration) {}

  async import(): Promise<BikeWeekEvent[]> {
    const [form, entryResponse] = await Promise.all([
      this.loadForms(),
      this.loadEntries(),
    ]);
    const eventHelper = new EventHelper(form, this.config);

    const retval = Array<BikeWeekEvent>();
    for (const entry of entryResponse.entries) {
      const [sponsors, sponsorUrls] = eventHelper.getSponsorInfo(entry);
      const stringStatus = eventHelper.lookupFieldValue(entry, "status");
      const status =
        reverseMapEventStatus(stringStatus) ?? EventStatus.SUBMITTED;
      retval.push({
        id: entry.id,
        name: eventHelper.requireFieldValue(entry, "event_name"),
        eventUrl: eventHelper.lookupFieldValue(entry, "event_url"),
        description: eventHelper.requireFieldValue(entry, "event_description"),
        sponsors,
        sponsorUrls,
        location: eventHelper.getLocationInfo(entry),
        eventTypes: eventHelper.getEventTypes(entry),
        eventDays: eventHelper.getEventDays(entry),
        eventTimes: eventHelper.getEventTimes(entry),
        eventGraphicUrl: eventHelper.lookupFieldValue(entry, "event_graphic"),
        modifyDate: entry.date_updated,
        status: status,
      });
    }
    return retval;
  }

  private async loadEntries(): Promise<EntryResponse> {
    const { body } = await superagent
      .get(`${this.config.gravityFormsUri}/entries`)
      .query({ form_ids: this.config.gravityFormsId })
      .auth(
        this.config.gravityFormsConsumerApiKey,
        this.config.gravityFormsConsumerSecret
      );
    return body;
  }

  private async loadForms(): Promise<FormResponse> {
    const { body } = await superagent
      .get(`${this.config.gravityFormsUri}/forms/${this.config.gravityFormsId}`)
      .auth(
        this.config.gravityFormsConsumerApiKey,
        this.config.gravityFormsConsumerSecret
      );
    return body;
  }
}

class EventHelper {
  constructor(
    private form: FormResponse,
    private configuration: Configuration
  ) {}

  getLocationInfo(entry: Entry): EventLocation | undefined {
    const firstChoice = this.lookupFieldValue(entry, "location_first");
    const mapped = locations.find((value) => value.id == firstChoice);
    if (!mapped && firstChoice != "N/A" && firstChoice != "None") {
      console.log(`Missing location map for ${firstChoice}`);
    }
    return mapped;
  }

  getEventDays(entry: Entry): EventDay[] {
    const eventDays = this.requireMultiFieldValue(entry, "event_days");
    const retval = new Array<EventDay>();
    for (const day of eventDays) {
      const parsedDate = parse(
        day,
        "EEEE, LLLL d",
        this.configuration.EVENT_START_DATE
      );
      if (Number.isNaN(parsedDate.getTime())) {
        throw Error(`Invalid date encountered ${day}`);
      }
      retval.push({ localDate: parsedDate });
    }
    return retval;
  }

  getEventTypes(entry: Entry): string[] {
    return this.requireMultiFieldValue(entry, "event_type");
  }

  getEventTimes(entry: Entry): EventTime[] {
    const eventStart = this.lookupFieldValue(entry, "event_start");
    const eventEnd = this.lookupFieldValue(entry, "event_end");
    return [{ start: eventStart, end: eventEnd }];
  }

  /** return parsed sponsor info from format like this "Madison Bikes (https://www.madisonbikes.org);City of Madison" */
  getSponsorInfo(entry: Entry) {
    const baseSponsorText = this.requireFieldValue(entry, "sponsors");
    let separator = ",";
    if (baseSponsorText.includes(";")) {
      separator = ";";
    }
    const sponsors = baseSponsorText.split(separator).map((v) => v.trim());
    const sponsor_urls = new Array<string>(sponsors.length);
    for (const ndx in sponsors) {
      const res = sponsors[ndx].match(/(.*)\((.+)\)/);
      if (!res) {
        sponsor_urls[ndx] = "";
      } else {
        sponsors[ndx] = res[1].trim();
        sponsor_urls[ndx] = res[2].trim();
      }
    }
    return [sponsors, sponsor_urls];
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

    const inputs = this.form.fields
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
    return this.form.fields.find((value) => value.adminLabel == adminLabel)?.id;
  }
}

