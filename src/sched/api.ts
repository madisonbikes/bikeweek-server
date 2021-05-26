import { AddSessionRequest, DeleteSessionRequest, SessionListRequest, ModifySessionRequest, SessionListResponse } from "./types";
import superagent, { Request, Response } from "superagent";
import { error, ok, Result } from "../util/result";

export async function addSession(session: AddSessionRequest): Promise<Result<void, string>> {
  const response = await postRequest("session/add", session);
  if(response.error) {
    return error(response.text)
  } else {
    return ok(undefined)
  }
}

export async function modifySession(session: ModifySessionRequest): Promise<Result<void, string>> {
  const response = await postRequest("session/mod", session);
  if(response.error) {
    return error(response.text)
  } else {
    return ok(undefined)
  }
}

export async function listSessions(query?: SessionListRequest): Promise<Result<SessionListResponse[], string>> {
  const newQuery = { format: "json", ...query };
  const response = await postRequest("session/list", newQuery);
  if(response.error) {
    return error(response.text)
  } else {
    const body = response.body
    return ok(body as SessionListResponse[])
  }
}

export async function deleteSession(session: DeleteSessionRequest): Promise<Result<void, string>> {
  const response = await postRequest("session/del", session);
  if(response.error) {
    return error(response.text)
  } else {
    const body = response.body
    return ok(undefined)
  }
}

function postRequest(endpoint: string, requestData: any): Request {
  const newRequestData = { ...requestData, api_key: process.env.SCHED_API_KEY };
  const fullEndpoint = endpointBase() + endpoint
  return superagent.post(fullEndpoint)
    .set("User-Agent", "madisonbikeweek2021-importer/1.0.0")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send(newRequestData);
}

function endpointBase() {
  return process.env.SCHED_URI + "/api/";
}



