import { z } from "zod";
import { bikeWeekEventSchema } from "../routes/contract";

export const dbStatusSchema = z.object({ lastSchedSync: z.date().optional() });
export type DbStatus = z.infer<typeof dbStatusSchema>;

export const dbBikeWeekEventSchema = bikeWeekEventSchema.extend({});
export type DbBikeWeekEvent = z.infer<typeof dbBikeWeekEventSchema>;

export const dbFederatedProviderSchema = z.enum(["google"]);
export type DbFederatedProvider = z.infer<typeof dbFederatedProviderSchema>;

export const dbFederatedIdentitySchema = z.object({
  provider: dbFederatedProviderSchema,
  id: z.string(),
});
export const dbUserSchema = z.object({
  username: z.string(),
  hashed_password: z.string(),
  roles: z.string().array().optional().default([]),
  federated: dbFederatedIdentitySchema.array().optional(),
});

export type DbUser = z.infer<typeof dbUserSchema>;
