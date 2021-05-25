
import { AddSession, GetSessionsList, ModifySession } from "./types";
import superagent, { Request, Response } from "superagent";

export async function addSession(session: AddSession): Promise<Response> {
  return postRequest("session/add", session)
}

export async function modifySession(session: ModifySession): Promise<Response> {
  return postRequest("session/mod", session)
}

export async function listSessions(query?: GetSessionsList): Promise<Response> {
  return postRequest("session/list", query)
}

function postRequest(endpoint: string, request: any): Request {
  const newRequest = {...request, api_key: process.env.SCHED_API_KEY}
  return superagent.post(endpointBase() + endpoint)
    .set("User-Agent", "madisonbikeweek2021-importer/1.0.0")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send(newRequest)
}

function endpointBase() {
  return process.env.SCHED_ENDPOINT + "/api/"
}



