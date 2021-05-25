export interface GetSessionsList {
  since?: number
  format?: string
  status?: string
  custom_data?: string
}

export interface AddSession {
  session_key: string,
  name: string,
  session_start: string,
  session_end: string,
  session_type: string,
  session_subtype?: string,
  description?: string,
  media_url?: string,
  venue?: string,
  address?: string,
  tags?: string,
  seats?: string,
  rsvp_url?: string,
  ticket_message?: string,
  active?: string
}

export interface ModifySession {
  session_key: string,
  name?: string,
  session_start?: string,
  session_end?: string,
  session_type?: string,
  session_subtype?: string,
  description?: string,
  media_url?: string,
  venue?: string,
  address?: string,
  tags?: string,
  seats?: string,
  rsvp_url?: string,
  ticket_message?: string,
  active?: string
}