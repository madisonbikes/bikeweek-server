import { injectable } from "tsyringe";
import { format } from "date-fns";
import {
  BikeWeekEvent,
  EventStatus,
  EventTypes,
  isAllDayEvent,
  isDiscountEvent,
} from "../event_types";
import { SchedApi } from "./api";
import { buildMapsUrl } from "../locations";

@injectable()
export class SchedExporter {
  constructor(private sched: SchedApi) {}

  async start(allEvents: BikeWeekEvent[]): Promise<void> {
    const sessionsResponse = await this.sched.exportSessions();
    if (sessionsResponse.isError()) {
      throw new Error(sessionsResponse.value);
    }

    const sessionList = sessionsResponse.value;
    const existingKeys = new Set<string>(
      sessionList.map((item) => {
        return item.event_key;
      })
    );
    const handledKeys = new Set<string>();
    const events = [...allEvents]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((event) => !isDiscountEvent(event) && !isAllDayEvent(event));

    for (const event of events) {
      for (const day of event.eventDays) {
        for (const timeNdx in event.eventTimes) {
          const time = event.eventTimes[timeNdx];
          const dayOfYear = format(day.localDate, "DDD");
          const key = `${event.id}.${dayOfYear}.${timeNdx}`;
          const description = this.buildDescription(event);

          const timeBase = format(day.localDate, "yyyy-MM-dd");
          const sessionStart = `${timeBase} ${time.start}`;
          const sessionEnd = `${timeBase} ${time.end}`;
          const base = {
            session_key: key,
            name:
              event.status !== EventStatus.CANCELLED
                ? event.name
                : `CANCELLED - ${event.name}`,
            description: description,
            // format: YYYY-MM-DD HH:MM
            session_start: sessionStart,
            session_end: sessionEnd,
            session_type: event.eventTypes
              .filter((value) => value != EventTypes.ENDOFWEEKPARTY)
              .join(","),
            venue: event.location?.sched_venue ?? event.location?.name ?? "",
            address: event.location?.sched_address ?? "",
            active: event.status === EventStatus.APPROVED ? "Y" : "N",
            rsvp_url: event.location ? buildMapsUrl(event.location) : "",
            media_url: event.eventGraphicUrl,
          };
          let result;
          let action;
          if (existingKeys.has(key)) {
            result = await this.sched.modifySession(base);
            action = "modified";
          } else {
            result = await this.sched.addSession(base);
            action = "added";
          }
          if (result.isError()) {
            console.log(`${key} ${action} error: ${result.value}`);
          } else {
            console.log(
              `${key} ${action} ok(${result.value}) status: ${event.status}`
            );
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
      const result = await this.sched.deleteSession({
        session_key: key.toString(),
      });
      console.log(result);
    }
  }

  buildDescription(event: BikeWeekEvent): string {
    let description = "";
    const sponsor = this.buildSponsor(event);
    if (sponsor) {
      description += `<strong>${sponsor}</strong><br>\n`;
    }

    let modified = event.description;

    // ditch any carriage returns, how archaic
    modified = modified.replace(/\r/g, "")

    // replace double breaks with a real HTML break
    modified = modified.replace(/\n\n/g, "<br>\n")

    description += modified;

    if (event.eventUrl) {
      description += `\n<br><a href="${event.eventUrl}">Learn more about this event here!</a>`;
    }
    return description;
  }

  buildSponsor(event: BikeWeekEvent): string | undefined {
    let sponsorText = "";
    if (event.sponsors.length > 0) {
      sponsorText += "Hosted by ";
      event.sponsors.forEach((value, index) => {
        if (index > 0) {
          if (index == event.sponsors.length - 1) {
            sponsorText += " and ";
          } else {
            sponsorText += ", ";
          }
        }
        const url = event.sponsorUrls[index];
        if (url && url.length > 0) {
          sponsorText += `<a href="${url}">${event.sponsors[index]}</a>`;
        } else {
          sponsorText += event.sponsors[index];
        }
      });
    }
    if (sponsorText.length > 0) {
      return sponsorText;
    } else {
      return undefined;
    }
  }
}