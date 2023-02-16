import { z } from "zod";
import { bikeWeekEventSchema } from "../routes/contract";

export const dbStatusSchema = z.object({ lastSchedSync: z.date().optional() });
export type DbStatus = z.infer<typeof dbStatusSchema>;

export const dbBikeWeekEventSchema = bikeWeekEventSchema.extend({});
export type DbBikeWeekEvent = z.infer<typeof dbBikeWeekEventSchema>;

export const dbUserSchema = z.object({
  username: z.string(),
  hashed_password: z.string(),
  roles: z.string().array().optional().default([]),
});

export type DbUser = z.infer<typeof dbUserSchema>;
