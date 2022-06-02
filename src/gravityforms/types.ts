/** schema for gravity forms responses */

export type Entry = {
  [key: string]: unknown;
  id: number;
  form_id: number;
  post_id?: number;
  date_created: string;
  date_updated: string;
  status: string;
};

export type EntryResponse = {
  total_count: number;
  entries: Entry[];
};
export type Choice = {
  text: string;
  value: string;
  isSelected: boolean;
};

export type Input = {
  id: string;
  label: string;
  name: string;
};

export type Field = {
  type: string;
  id: number;
  label: string;
  adminLabel: string;
  choices?: Choice[];
  inputs?: Input[];
};

export type FormResponse = {
  title: string;
  fields: Field[];
};
