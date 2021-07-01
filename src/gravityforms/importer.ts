import superagent from "superagent";

import { Entry, EntryResponse, FormResponse } from "./schema";

import {
  BikeWeekEvent,
  EventDay,
  EventLocation,
  EventTime
} from "../event_types";
import { injectable } from "tsyringe";
import { Configuration } from "../config";

@injectable()
export class Importer {
  constructor(private config: Configuration) {
  }

  async import(): Promise<BikeWeekEvent[]> {
    const [form, entryResponse] = await Promise.all([
      this.loadForms(),
      this.loadEntries()
    ]);
    const eventHelper = new EventHelper(form, entryResponse);

    const retval = Array<BikeWeekEvent>();
    for (const entry of entryResponse.entries) {
      const baseSponsorText = eventHelper.requireFieldValue(entry, "sponsors");
      let separator = ",";
      if (baseSponsorText.includes(";")) {
        separator = ";";
      }
      const sponsor = baseSponsorText.split(separator).map((v) => v.trim());
      const sponsor_urls = new Array<string>(sponsor.length);
      for(const ndx in sponsor) {
        console.log(ndx)
      }
      const location: EventLocation = {};
      const eventTypes = eventHelper.lookupMultiFieldValue(entry, "event_type");
      const types = new Set<string>(eventTypes);

      const eventDays = eventHelper.lookupMultiFieldValue(entry, "event_days");
      const days: EventDay[] = [];
      const eventStart = eventHelper.lookupFieldValue(entry, "event_start");
      const eventEnd = eventHelper.lookupFieldValue(entry, "event_end");
      const times: EventTime[] = [{ start: eventStart, end: eventEnd }];
      retval.push({
        id: entry.id,
        name: eventHelper.requireFieldValue(entry, "event_name"),
        event_url: eventHelper.lookupFieldValue(entry, "event_url"),
        description: eventHelper.requireFieldValue(entry, "event_description"),
        sponsor: sponsor,
        sponsor_urls: sponsor_urls,
        location: location,
        eventTypes: types,
        eventDays: days,
        eventTimes: times
      });
    }
    return retval;
  }

  async loadEntries(): Promise<EntryResponse> {
    const { body } = await superagent
      .get(`${this.config.gravityFormsUri}/entries`)
      .query({ form_ids: this.config.gravityFormsId })
      .auth(
        `${process.env.GF_CONSUMER_API_KEY}`,
        `${process.env.GF_CONSUMER_SECRET}`
      );
    return body;
  }

  async loadForms(): Promise<FormResponse> {
    const { body } = await superagent
      .get(`${this.config.gravityFormsUri}/forms/${this.config.gravityFormsId}`)
      .auth(
        `${process.env.GF_CONSUMER_API_KEY}`,
        `${process.env.GF_CONSUMER_SECRET}`
      );
    return body;
  }
}

class EventHelper {
  constructor(private form: FormResponse, private entries: EntryResponse) {
  }

  requireFieldValue(entry: Entry, adminLabel: string): string {
    const fieldValue = this.lookupFieldValue(entry, adminLabel);
    if (!fieldValue) {
      throw new Error(`No entry for admin label ${adminLabel}`);
    }
    return fieldValue;
  }

  lookupMultiFieldValue(entry: Entry, adminLabel: string): string[] | undefined {
    const fieldId = this.lookupFieldId(adminLabel);
    if (!fieldId) return undefined;

    const inputs = this.form.fields.find((value) => value.id == fieldId)
      ?.inputs
      ?.map((input) => input.id);
    if (!inputs) return undefined;

    const retval = new Array<string>();
    for (const i of inputs) {
      const value = entry[i];
      if (value && value.length > 0) {
        retval.push(value);
      }
    }
    return retval;
  }

  lookupFieldValue(entry: Entry, adminLabel: string): string | undefined {
    const fieldId = this.lookupFieldId(adminLabel);
    if (!fieldId) return undefined;
    return (entry)[`${fieldId}`];
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

/*
function processData(data: ImportedEvent): BikeWeekEvent {


  const event_types = data.type
    .split(",")
    .map(v => v.trim())

  const days = data.days
    .split(",")
    .map(v => +v)
    .map(dayOffset => {
      const dayDate = add(EVENT_START_DATE, {days: (dayOffset-1)})
      const eventDay: EventDay = { localDate: dayDate}
      return eventDay
    })

  const times: EventTime[] = data.time
    .split(",")
    .map(v => v.trim())
    .map(timeRange => {
      const parsed = timeRange.split("-")
      if(parsed.length <= 0 || parsed.length > 2) {
        throw new Error(`Time format not recognized ${timeRange}`)
      }
      if(parsed.length == 1) {
        return { start: parsed[0] } as EventTime
      } else {
        return { start: parsed[0], end: parsed[1] } as EventTime
      }
    })

  const location: EventLocation = {
    mapsDescription: data.maps_description,
    mapsQuery: data.maps_query,
    mapsPlaceId: data.maps_placeid,
    locationFree: data.location_free
  }

  return {
    name: data.name,
    event_url: data.event_url,
    description: data.description,
    sponsor: sponsor,
    sponsor_urls: sponsor_urls,
    eventTypes: new Set(event_types),
    location: location,
    eventDays: days,
    eventTimes: times
  }
}
*/
