import { EventLocation } from "./locations";

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
  PENDING
}

/** is this really as good as typescript can do? blech! */
export function reverseMapEventStatus(
  value: string | undefined
): EventStatus | undefined {
  switch (value?.toLowerCase()) {
    case "approved":
      return EventStatus.APPROVED;
    case "cancelled":
      return EventStatus.CANCELLED;
    case "pending":
      return EventStatus.PENDING;
    case "submitted":
      return EventStatus.SUBMITTED;
    default:
      return undefined;
  }
}

export enum EventTypes {
  DISCOUNT = "discount", ENDOFWEEKPARTY = "endofweekparty", PAID = "paid", FREE = "free"
}

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

export function isDiscountEvent(event: BikeWeekEvent): boolean {
  return event.eventTypes.includes(EventTypes.DISCOUNT);
}

export function isEndOfWeekParty(event: BikeWeekEvent): boolean {
  return event.eventTypes.includes(EventTypes.ENDOFWEEKPARTY);
}

export function isAllDayEvent(event: BikeWeekEvent): boolean {
  return event.eventTimes.length === 0
}
