import { injectable } from "tsyringe";
import { format } from "date-fns";
import { BikeWeekEvent } from "../event_types";
import converter from "showdown";
import buildUrl from "build-url";
import { SchedApi } from "./api";

@injectable()
export class Exporter {
  constructor(private sched: SchedApi) {
  }

  async start(events: BikeWeekEvent[]): Promise<void> {
    const sessionListResponse = await this.sched.listSessions();
    if (sessionListResponse.isError()) {
      throw new Error(sessionListResponse.value);
    }

    const sessionList = sessionListResponse.value;
    const existingKeys = new Set<number>(
      sessionList.map((item) => {
        return Number.parseInt(item.event_key)
      })
    );
    const handledKeys = new Set<number>();

    for (const event of events) {
      for (const day of event.eventDays) {
        for (const time of event.eventTimes) {
          const key = event.id;
          const description = this.buildDescription(event);

          const timeBase = format(day.localDate, "yyyy-MM-dd");
          const sessionStart = `${timeBase} ${time.start}`;
          let sessionEnd;
          if (time.end) {
            sessionEnd = `${timeBase} ${time.end}`;
          } else {
            sessionEnd = `${timeBase} ${time.start}`;
          }
          const base = {
            session_key: key.toString(),
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
            const modded = await this.sched.modifySession(base);
            if (modded.isError()) {
              console.log(`${key} error: ${modded}`);
            } else {
              console.log(`${key} modified ok`);
            }
          } else {
            const modded = await this.sched.addSession(base);
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

    // remove handledKeys from the total key list
    for (const key of handledKeys) {
      existingKeys.delete(key);
    }

    // delete any remaining sessions
    // FIXME this should probably be removed once the sessions have stabilized
    for (const key of existingKeys) {
      const result = await this.sched.deleteSession({ session_key: key.toString() });
      console.log(result);
    }
  }

  buildDescription(event: BikeWeekEvent): string {
    const mapsLink = this.buildMapsUrl(event);

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

  buildMapsUrl(event: BikeWeekEvent): string | undefined {
    const location = event.location;
    let params: { [name: string]: string | string[] } = {
      api: "1",
    };
    if (location.mapsQuery && location.mapsQuery != "") {
      params = { ...params, query: location.mapsQuery };
    } else if (location.mapsDescription && location.mapsDescription != "") {
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
}