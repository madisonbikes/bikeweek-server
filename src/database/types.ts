import { z } from "zod";

export const EventTimeSchema = z.object({
  start: z.string(),
  end: z.string(),
});
export type EventTime = z.infer<typeof EventTimeSchema>;

export const EventStatusSchema = z.enum([
  "submitted",
  "approved",
  "cancelled",
  "pending",
]);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const EventSponsorSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
});
export type EventSponsor = z.infer<typeof EventSponsorSchema>;

export const EventLocationSchema = z.object({
  name: z.string(),
  sched_venue: z.string().optional(), // defaults to name if null
  sched_address: z.string().optional(), // required for specific address info
  maps_query: z.string().optional(),
  maps_description: z.string().optional(),
  maps_placeid: z.string().optional(),
  detailed_location_description: z.string().optional(),
});
export type EventLocation = z.infer<typeof EventLocationSchema>;

export const BikeWeekEventSchema = z.object({
  id: z.number(),
  name: z.string(),
  eventUrl: z.string().optional(),
  description: z.string(),
  eventGraphicUrl: z.string().optional(),
  sponsors: EventSponsorSchema.array(),
  location: EventLocationSchema.optional(),
  eventTypes: z.string().array(),
  eventDays: z.date().array(),
  eventTimes: EventTimeSchema.array(),
  status: EventStatusSchema,
  comments: z.string().optional(),
  modifyDate: z.date(),
  createDate: z.date(),
});
export type BikeWeekEvent = z.infer<typeof BikeWeekEventSchema>;
