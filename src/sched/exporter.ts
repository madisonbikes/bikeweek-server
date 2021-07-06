import { injectable } from "tsyringe";
import { format } from "date-fns";
import { BikeWeekEvent } from "../event_types";
import buildUrl from "build-url";
import { SchedApi } from "./api";

@injectable()
export class Exporter {
  constructor(private sched: SchedApi) {
  }

  async start(events: BikeWeekEvent[]): Promise<void> {
    const sessionsResponse = await this.sched.exportSessions();
    if (sessionsResponse.isError()) {
      throw new Error(sessionsResponse.value);
    }

    const sessionList = sessionsResponse.value;
    const existingKeys = new Set<string>(
      sessionList.map((item) => {
        return item.event_key
      })
    );
    const handledKeys = new Set<string>();

    for (const event of events) {
      for (const day of event.eventDays) {
        for (const timeNdx in event.eventTimes) {
          const time = event.eventTimes[timeNdx]
          if(!time.start || !time.end) {
            console.log(`skipping session ${event.name} that has no start/end time`)
            continue
          }

          const dayOfYear = format(day.localDate, "DDD")
          const key = `${event.id}.${dayOfYear}.${timeNdx}`;
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
            session_key: key,
            name: event.name,
            description: description,
            // format: YYYY-MM-DD HH:MM
            session_start: sessionStart,
            session_end: sessionEnd,
            session_type: event.eventTypes.join(","),
            venue: event.location.mapsDescription,
            address: event.location.mapsDescription,
            active: event.approved ? "Y" : "N",
            rsvp_url: this.buildMapsUrl(event),
            media_url: event.eventGraphicUrl
          };
          let result;
          let action;
          if (existingKeys.has(key)) {
            result = await this.sched.modifySession(base);
            action = "modified"
          } else {
            result = await this.sched.addSession(base);
            action = "added"
          }
          if (result.isError()) {
            console.log(`${key} ${action} error: ${result}`);
          } else {
            console.log(`${key} ${action} ok active: ${event.approved}`);
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
    let description = event.description;
    if (event.eventUrl) {
      description += `\n<br><a href="${event.eventUrl}">Event Page Link</a>`;
    }
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