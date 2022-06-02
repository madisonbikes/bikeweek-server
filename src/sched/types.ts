/** schema for sched responses */

export type BaseRequest = {
  [key: string]: unknown;
};

export type SessionListRequest = BaseRequest & {
  since?: number;
  format?: string;
  status?: string;
  custom_data?: string;
};

export type SessionExportRequest = BaseRequest & {
  since?: number;
  format?: string;
  status?: string;
  custom_data?: string;
};

export type DeleteSessionRequest = BaseRequest & {
  session_key: string;
};

export type AddSessionRequest = BaseRequest & {
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
};

export type ModifySessionRequest = BaseRequest & {
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
};

export type BaseResponse = {
  [key: string]: unknown;
};

export type SessionListResponse = BaseResponse & {
  event_key: string;
};

export type SessionExportResponse = BaseResponse & {
  event_key: string;
  active: string;
};
