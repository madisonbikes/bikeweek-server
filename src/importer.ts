import superagent from "superagent";
import csv from "csv-parser";
import tempy from "tempy";
import fs from "fs";
import { BikeWeekEvent, EVENT_START_DATE, EventDay, EventLocation, EventTime } from "./event_types";
import add from "date-fns/add"

type ImportedEvent = {
  name: string,
  event_url?: string,
  description: string,
  sponsor: string,
  sponsor_urls: string,
  maps_description: string,
  maps_query?: string,
  maps_placeid?: string,
  location_free?: string,
  type: string,
  days: string
  time: string,
  outside_of_madison?: string
}

export async function importer(): Promise<BikeWeekEvent[]> {
  // this is the 2019 list
  const data = await superagent.get(`${process.env.SOURCE_URI}/export?format=csv&gid=0`);
  const tempFile = tempy.file({ name: "events.csv" });
  await fs.promises.writeFile(tempFile, data.text);
  const results = await extractData(tempFile);
  await fs.promises.rm(tempFile);
  return results
}

async function extractData(filename: string): Promise<BikeWeekEvent[]> {
  return new Promise((resolve, reject) => {
    const results: BikeWeekEvent[] = [];

    fs.createReadStream(filename)
      .pipe(csv())
      .on("data", (data) => {
        const newData = processData(data)
        results.push(newData);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (e) => {
        reject(e)
      })
  });
}

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
