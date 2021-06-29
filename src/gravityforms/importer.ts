import superagent from "superagent";

import { EntryResponse, FormResponse } from "./schema";

import { BikeWeekEvent } from "../event_types";


export async function importer(): Promise<BikeWeekEvent[]> {
  const [form, entries] = await Promise.all([FormData.create(), EntryData.create()])

  return Promise.reject();
}

function uri() {
  return `${process.env.GF_SOURCE_URI}/wp-json/gf/v2`;
}

function formId() {
  return process.env.GF_FORM_ID;
}

class EntryData {
  public static create = async() => {
    const entries = new EntryData()
    const response = await superagent
      .get(`${uri()}/entries`)
      .query({ form_ids: formId() })
      .auth(
        `${process.env.GF_CONSUMER_API_KEY}`,
        `${process.env.GF_CONSUMER_SECRET}`
      );
    entries.data = JSON.parse(response.text)
    return entries
  }

  private data!: EntryResponse
  private constructor() {
    // do nothing
  }
}

class FormData {
  public static create = async() => {
    const form = new FormData()
    const response = await superagent
      .get(`${uri()}/forms/${formId()}`)
      .auth(
        `${process.env.GF_CONSUMER_API_KEY}`,
        `${process.env.GF_CONSUMER_SECRET}`
      );
    form.data = JSON.parse(response.text)
    return form
  }

  private data!: FormResponse
  private constructor() {
    // do nothing
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
