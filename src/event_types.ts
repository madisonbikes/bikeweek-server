import { parse } from "date-fns";

export const EVENT_START = "2021-09-11";
export const EVENT_START_DATE = parse(EVENT_START, "yyyy-MM-dd", new Date());

export type EventLocation = {
  mapsDescription?: string;
  //freeformMarkdownDescription?: string,
  mapsQuery?: string;
  mapsPlaceId?: string;
  locationFree?: string;
};

export type EventDay = {
  localDate: Date;
};

export type EventTime = {
  start: string;
  end?: string;
};

export type BikeWeekEvent = {
  name: string;
  event_url?: string;
  description: string;
  sponsor: string[];
  sponsor_urls: string[];
  location: EventLocation;
  eventTypes: Set<string>;
  eventDays: EventDay[];
  eventTimes: EventTime[];
};
