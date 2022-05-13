export type EventTime = {
  start: string;
  end: string;
};

export enum EventStatus {
  SUBMITTED = "submitted",
  APPROVED = "approved",
  CANCELLED = "cancelled",
  PENDING = "pending",
}

export type EventSponsor = {
  name: string;
  url: string;
};

export type EventLocation = {
  name: string;
  sched_venue?: string; // defaults to name
  sched_address?: string; // required for specific address info
  maps_query?: string;
  maps_description?: string;
  maps_placeid?: string;
  detailed_location_description?: string;
};

export type BikeWeekEvent = {
  id: number;
  name: string;
  eventUrl?: string;
  description: string;
  eventGraphicUrl?: string;
  sponsors: EventSponsor[];
  location?: EventLocation;
  eventTypes: string[];
  eventDays: Date[];
  eventTimes: EventTime[];
  status: EventStatus;
  comments?: string;
  modifyDate: Date;
  createDate: Date;
};
