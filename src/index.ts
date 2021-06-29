import dotenv from "dotenv";
import { importer } from "./gravityforms/importer";
import {
  addSession,
  deleteSession,
  listSessions,
  modifySession,
} from "./sched/api";
import crypto from "crypto";
import converter from "showdown";
import { BikeWeekEvent, EventDay, EventTime } from "./event_types";
import { format } from "date-fns";
import buildUrl from "build-url";

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
startup().then((_) => {
  // do a thing
});

async function startup(): Promise<void> {
  process.on("uncaughtException", (err) => {
    console.error(err);
    process.exit(1);
  });

  const importedEvents = await importer();

  /*
  const sessionListResponse = await listSessions();
  if (sessionListResponse.isError()) {
    console.error(sessionListResponse.value);
    process.exit(1);
  }

  const sessionList = sessionListResponse.value;
  const existingKeys = new Set(
    sessionList.map((item) => {
      return item.event_key;
    })
  );
  const handledKeys = new Set<string>();

  for (const event of importedEvents) {
    for (const day of event.eventDays) {
      for (const time of event.eventTimes) {
        const key = generateKey(event, day, time);
        const description = buildDescription(event);

        const timeBase = format(day.localDate, "yyyy-MM-dd");
        const sessionStart = `${timeBase} ${time.start}`;
        let sessionEnd;
        if (time.end) {
          sessionEnd = `${timeBase} ${time.end}`;
        } else {
          sessionEnd = `${timeBase} ${time.start}`;
        }
        const base = {
          session_key: key,
          name: event.name,
          description: description,
          // format: YYYY-MM-DD HH:MM
          session_start: sessionStart,
          session_end: sessionEnd,
          session_type: Array.from(event.eventTypes).join(","),
          venue: event.location.mapsDescription,
          address: event.location.mapsDescription,
        };
        if (existingKeys.has(key)) {
          const modded = await modifySession(base);
          if (modded.isError()) {
            console.log(`${key} error: ${modded}`);
          } else {
            console.log(`${key} modified ok`);
          }
        } else {
          const modded = await addSession(base);
          if (modded.isError()) {
            console.log(`${key} error: ${modded}`);
          } else {
            console.log(`${key} added ok`);
          }
        }
        handledKeys.add(key);
      }
    }
  }

  // remove handledkeys from the total key list
  for (const key of handledKeys) {
    existingKeys.delete(key);
  }

  // delete any remaining sessions
  // FIXME this should probably be removed once the sessions have stabilized
  for (const key of existingKeys) {
    const result = await deleteSession({ session_key: key });
    console.log(result);
  }
   */
}

function generateKey(
  event: BikeWeekEvent,
  day: EventDay,
  time: EventTime
): string {
  return crypto
    .createHash("md5")
    .update(event.name)
    .update(day.localDate.getDate().toString())
    .update(time.start)
    .digest("base64")
    .replace(/=/g, "");
}

function buildDescription(event: BikeWeekEvent): string {
  const mapsLink = buildMapsUrl(event);

  let description = event.description;
  if (event.event_url) {
    description += `\n\n\n[Event Page Link](${event.event_url})`;
  }
  description += `\n\n\n[Map](${mapsLink})`;

  description = new converter.Converter()
    .makeHtml(description)
    .replace(/\\/g, "");
  return description;
}

function buildMapsUrl(event: BikeWeekEvent): string | undefined {
  const location = event.location;
  let params: { [name: string]: string | string[] } = {
    api: "1",
  };
  if (location.mapsQuery && location.mapsQuery != "") {
    params = { ...params, query: location.mapsQuery };
  } else if(location.mapsDescription && location.mapsDescription != "") {
    params = { ...params, query: location.mapsDescription };
  }
  if (location.mapsPlaceId && location.mapsPlaceId != "") {
    params = { ...params, query_place_id: location.mapsPlaceId };
  }
  return buildUrl("https://www.google.com/", {
    path: "maps/search/",
    queryParams: params,
  });
}