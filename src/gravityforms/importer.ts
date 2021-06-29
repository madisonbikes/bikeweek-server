import superagent from "superagent";

import { EntryResponse, FormResponse } from "./schema";

import { BikeWeekEvent } from "../event_types";
import { injectable } from "tsyringe";
import { Configuration } from "../config";

@injectable()
export class Importer {
  constructor(private config: Configuration) {
  }

  async import(): Promise<BikeWeekEvent[]> {
    const [form, entries] = await Promise.all([
      this.loadForms(),
      this.loadEntries()
    ]);

    return Promise.reject("not implemented");
  }

  async loadEntries(): Promise<EntryResponse> {
    const response = await superagent
      .get(`${this.config.gravityFormsUri}/entries`)
      .query({ form_ids: this.config.gravityFormsId })
      .auth(
        `${process.env.GF_CONSUMER_API_KEY}`,
        `${process.env.GF_CONSUMER_SECRET}`
      );
    return JSON.parse(response.text);
  }

  async loadForms(): Promise<FormResponse> {
    const response = await superagent
      .get(`${this.config.gravityFormsUri}/forms/${this.config.gravityFormsId}`)
      .auth(
        `${process.env.GF_CONSUMER_API_KEY}`,
        `${process.env.GF_CONSUMER_SECRET}`
      );
    return JSON.parse(response.text);
  }
}

/*
function processData(data: ImportedEvent): BikeWeekEvent {
  const sponsor = data.sponsor
    .split(",")
    .map(v => v.trim())

  const sponsor_urls = data.sponsor_urls
    .split(",")
    .map(v => v.trim())

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
