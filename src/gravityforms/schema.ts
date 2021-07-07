/** schema for gravity forms responses */

export interface BaseEntry {
  [key: string]: unknown
  id: number
  form_id: number
  post_id?: number
  date_created: string
  date_updated: string
  status: string
}

export type Entry = BaseEntry

export interface EntryResponse {
  total_count: number
  entries: Entry[]
}
export interface Choice {
  text: string
  value: string
  isSelected: boolean
}

export interface Input {
  id: string
  label: string
  name: string
}

export interface Field {
  type: string
  id: number
  label: string
  adminLabel: string
  choices?: Choice[]
  inputs?: Input[]
}

export interface FormResponse {
  title: string
  fields: Field[]
}