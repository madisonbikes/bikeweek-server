/** schema for gravity forms responses */

export interface Entry {
  id: number
  form_id: number
  post_id?: number
  date_created: string
  dated_updated: string
  status: string
}

type FullEntry = Entry | unknown

export interface EntryResponse {
  total_count: number
  entries: FullEntry[]
}
export interface Choice {
  text: string
  value: string
  isSelected: boolean
}

export interface Field {
  type: string
  id: number
  label: string
  adminLabel: string
  choices?: Choice[]
}

export interface FormResponse {
  title: string
  fields: Field[]
}