/** schema for sched responses */

export interface BaseRequest {
  [key: string]: unknown;
}

export interface SessionListRequest extends BaseRequest {
  since?: number;
  format?: string;
  status?: string;
  custom_data?: string;
}

export interface SessionExportRequest extends BaseRequest {
  since?: number;
  format?: string;
  status?: string;
  custom_data?: string;
}

export interface DeleteSessionRequest extends BaseRequest {
  session_key: string;
}

export interface AddSessionRequest extends BaseRequest {
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

export interface BaseResponse {
  [key: string]: unknown;
}

export interface SessionListResponse extends BaseResponse {
  event_key: string;
}

export interface SessionExportResponse extends BaseResponse {
  event_key: string;
  active: string;
}

export interface ModifySessionRequest extends BaseRequest {
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
