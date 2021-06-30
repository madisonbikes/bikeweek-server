/** schema for sched responses */

export interface SessionListRequest {
  since?: number;
  format?: string;
  status?: string;
  custom_data?: string;
}

export interface DeleteSessionRequest {
  session_key: string;
}

export interface AddSessionRequest {
  session_key: string;
  name: string;
  session_start: string;
  session_end: string;
  session_type: string;
  session_subtype?: string;
  description?: string;
  media_url?: string;
  venue?: string;
  address?: string;
  tags?: string;
  seats?: string;
  rsvp_url?: string;
  ticket_message?: string;
  active?: string;
}

export interface SessionListResponse {
  event_key: string;
}

export interface ModifySessionRequest {
  session_key: string;
  name?: string;
  // format: YYYY-MM-DD HH:MM
  session_start?: string;

  // format: YYYY-MM-DD HH:MM
  session_end?: string;
  session_type?: string;
  session_subtype?: string;
  description?: string;
  media_url?: string;
  venue?: string;
  address?: string;
  tags?: string;
  seats?: string;
  rsvp_url?: string;
  ticket_message?: string;
  active?: string;
}
