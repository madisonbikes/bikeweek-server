import { BikeWeekEvent } from "../event_types";

/** because of life, sometimes we need to override the form options */
export function overrideEventData(event: BikeWeekEvent): void {
  if (event.eventUrl === "https://www.delta.beer/events") {
    event.eventDays = [{ localDate: new Date("09-11-2021") }];
  } else if(event.eventUrl === "https://www.bikefitchburg.org/events.html") {
    event.eventDays = [{ localDate: new Date("09-11-2021") }];
  }
}
