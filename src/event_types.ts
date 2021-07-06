import { EventLocation } from "./locations";

export type EventDay = {
  localDate: Date;
};

export type EventTime = {
  start?: string;
  end?: string;
};

export type EventStatus = "submitted" | "approved" | "cancelled"

export type BikeWeekEvent = {
  id: number;
  name: string;
  eventUrl?: string;
  description: string;
  eventGraphicUrl?: string;
  sponsors: string[];
  sponsorUrls: string[];
  location?: EventLocation;
  eventTypes: string[];
  eventDays: EventDay[];
  eventTimes: EventTime[];
  modifyDate?: string;
  status: EventStatus;
};
