import {
  AddSessionRequest,
  DeleteSessionRequest,
  ModifySessionRequest,
  SessionListRequest,
  SessionListResponse,
} from "./types";
import superagent, { Request } from "superagent";
import { error, ok, Result } from "../util/result";
import { sleep } from "../util/await-sleep";

export async function addSession(
  session: AddSessionRequest
): Promise<Result<unknown, string>> {
  const response = await postRequest("session/add", session);
  if (response.error) {
    return error(response.text);
  } else {
    return ok(response.body);
  }
}

export async function modifySession(
  session: ModifySessionRequest
): Promise<Result<unknown, string>> {
  const response = await postRequest("session/mod", session);
  if (response.error) {
    return error(response.text);
  } else {
    return ok(response.body);
  }
}

export async function listSessions(
  query?: SessionListRequest
): Promise<Result<SessionListResponse[], string>> {
  const newQuery = { format: "json", ...query };
  const response = await postRequest("session/list", newQuery);
  if (response.error) {
    return error(response.text);
  } else {
    const body = response.body;
    return ok(body as SessionListResponse[]);
  }
}

export async function deleteSession(
  session: DeleteSessionRequest
): Promise<Result<unknown, string>> {
  const response = await postRequest("session/del", session);
  if (response.error) {
    return error(response.text);
  } else {
    return ok(response.body);
  }
}

async function postRequest(
  endpoint: string,
  requestData: any
): Promise<Request> {
  await checkThrottle();

  const newRequestData = {
    ...requestData,
    api_key: process.env.SCHED_API_KEY,
  };
  const fullEndpoint = endpointBase() + endpoint;
  return superagent
    .post(fullEndpoint)
    .set("User-Agent", "madisonbikeweek2021-importer/1.0.0")
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send(newRequestData);
}

let callCount = 0;

async function checkThrottle() {
  callCount++;
  if (callCount % 15 == 0) {
    console.log("throttling api call, waiting 30 seconds");
    await sleep(30000);
  }
}

function endpointBase() {
  return process.env.SCHED_URI + "/api/";
}



