import { z } from "zod";
import { bikeWeekEventSchema } from "../routes/contract";

export const dbStatusSchema = z.object({ lastSchedSync: z.date().optional() });
export type DbStatus = z.infer<typeof dbStatusSchema>;

export const dbBikeWeekEventSchema = bikeWeekEventSchema.extend({});
export type DbBikeWeekEvent = z.infer<typeof dbBikeWeekEventSchema>;

export const dbUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  admin: z.boolean().optional(),
});

export type DbUser = z.infer<typeof dbUserSchema>;
