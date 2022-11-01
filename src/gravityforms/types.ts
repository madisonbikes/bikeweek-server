/** schema for gravity forms responses */

import { z } from "zod";

export const EntrySchema = z
  .object({
    id: z.number(),
    form_id: z.string(),
    post_id: z.string().optional(),
    date_created: z.string(),
    date_updated: z.string(),
    status: z.string(),
  })
  .passthrough();
export type Entry = z.infer<typeof EntrySchema>;

export const EntryResponseSchema = z.object({
  total_count: z.number(),
  entries: EntrySchema.array(),
});
export type EntryResponse = z.infer<typeof EntryResponseSchema>;

const ChoiceSchema = z.object({
  text: z.string(),
  value: z.string(),
  isSelected: z.boolean(),
});

const InputSchema = z.object({
  id: z.string(),
  label: z.string(),
  name: z.string(),
});

export const FieldSchema = z.object({
  type: z.string(),
  id: z.number(),
  label: z.string(),
  adminLabel: z.string(),
  choices: ChoiceSchema.array().optional(),
  inputs: InputSchema.array().optional(),
});
export type Field = z.infer<typeof FieldSchema>;

export const FormResponseSchema = z.object({
  title: z.string(),
  fields: FieldSchema.array(),
});

export type FormResponse = z.infer<typeof FormResponseSchema>;
