export type EventDay = {
  localDate: Date;
};

export type EventTime = {
  start: string;
  end: string;
};

export enum EventStatus {
  SUBMITTED,
  APPROVED,
  CANCELLED,
  PENDING,
}

export type EventSponsor = {
  name: string;
  url: string;
};

export enum EventTypes {
  DISCOUNT = "discount",
  ENDOFWEEKPARTY = "endofweekparty",
  PAID = "paid",
  FREE = "free",
}

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
  eventDays: EventDay[];
  eventTimes: EventTime[];
  modifyDate?: string;
  status: EventStatus;
};
