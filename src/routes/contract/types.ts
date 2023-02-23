import { z } from "zod";

export const eventTimeSchema = z.object({
  start: z.string(),
  end: z.string(),
});
export type EventTime = z.infer<typeof eventTimeSchema>;

export const eventStatusSchema = z.enum([
  "submitted",
  "approved",
  "cancelled",
  "pending",
]);
export type EventStatus = z.infer<typeof eventStatusSchema>;

export const eventSponsorSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
});
export type EventSponsor = z.infer<typeof eventSponsorSchema>;

export const eventLocationSchema = z.object({
  name: z.string(),
  sched_venue: z.string().optional(), // defaults to name if null
  sched_address: z.string().optional(), // required for specific address info
  maps_query: z.string().optional(),
  maps_description: z.string().optional(),
  maps_placeid: z.string().optional(),
  detailed_location_description: z.string().optional(),
});
export type EventLocation = z.infer<typeof eventLocationSchema>;

export const eventDaysArraySchema = z.coerce.date().array();

export const bikeWeekEventSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  eventUrl: z.string().optional(),
  description: z.string(),
  eventGraphicUrl: z.string().optional(),
  sponsors: eventSponsorSchema.array(),
  location: eventLocationSchema.optional(),
  eventTypes: z.string().array(),
  eventDays: eventDaysArraySchema,
  eventTimes: eventTimeSchema.array(),
  status: eventStatusSchema,
  comments: z.string().optional(),
  modifyDate: z.coerce.date(),
  createDate: z.coerce.date(),
});
export type BikeWeekEvent = z.infer<typeof bikeWeekEventSchema>;

/** mutate removes several fields */
export const mutateBikeWeekEventSchema = bikeWeekEventSchema
  .omit({
    modifyDate: true,
    createDate: true,
    id: true,
  })
  .partial()
  .strict();
export type MutateBikeWeekEvent = z.infer<typeof mutateBikeWeekEventSchema>;

export const loginBodySchema = z
  .object({
    username: z.string(),
    password: z.string(),
  })
  .strict();

export type LoginBody = z.infer<typeof loginBodySchema>;

export const federatedProviderSchema = z.enum(["google"]);
export type FederatedProvider = z.infer<typeof federatedProviderSchema>;

export const federatedIdentitySchema = z.object({
  provider: federatedProviderSchema,

  /** normally an email */
  federatedId: z.string(),
});
export type FederatedIdentity = z.infer<typeof federatedIdentitySchema>;

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  roles: z.string().array().default([]),
  federated: federatedIdentitySchema.array().optional(),
});
export type User = z.infer<typeof userSchema>;

export const mutateUserSchema = z
  .object({
    change_password: z.object({ old: z.string(), new: z.string() }),
    add_federated: z.object({
      provider: federatedProviderSchema,
      validateToken: z.string(),
    }),
    remove_federated: federatedProviderSchema,
  })
  .strict()
  .partial();
export type MutateUser = z.infer<typeof mutateUserSchema>;

export const userWithPasswordSchema = userSchema.extend({
  password: z.string(),
});
export type UserWithPassword = z.infer<typeof userWithPasswordSchema>;

export const federatedGoogleAuthBodySchema = z.object({ token: z.string() });
export type FederatedGoogleAuthBody = z.infer<
  typeof federatedGoogleAuthBodySchema
>;

export const authenticatedUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  roles: z.string().array().optional(),
  federated: federatedIdentitySchema.array().optional(),
});
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
