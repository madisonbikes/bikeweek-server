import {
  AddSessionRequest,
  DeleteSessionRequest,
  ModifySessionRequest,
  SessionExportRequest,
  SessionExportResponse,
  SessionListRequest,
  SessionListResponse,
} from "./types";
import superagent from "superagent";
import { error, ok, Result } from "../util/result";
import { sleep } from "../util/await-sleep";
import { injectable } from "tsyringe";
import { Configuration } from "../config";

@injectable()
export class SchedApi {
  constructor(private configuration: Configuration) {}

  async addSession(
    session: AddSessionRequest
  ): Promise<Result<unknown, string>> {
    const response = await this.postRequest("session/add", session);
    if (response.error) {
      return error(response.text);
    } else {
      return ok(response.text);
    }
  }

  async modifySession(
    session: ModifySessionRequest
  ): Promise<Result<unknown, string>> {
    const response = await this.postRequest("session/mod", session);
    if (response.error) {
      return error(response.text);
    } else {
      return ok(response.text);
    }
  }

  async listSessions(
    query?: SessionListRequest
  ): Promise<Result<SessionListResponse[], string>> {
    const newQuery = { format: "json", ...query };
    const response = await this.postRequest("session/list", newQuery);
    if (response.error) {
      return error(response.text);
    } else {
      const body = response.body;
      return ok(body as SessionListResponse[]);
    }
  }

  async exportSessions(
    query?: SessionExportRequest
  ): Promise<Result<SessionExportResponse[], string>> {
    const newQuery = { format: "json", ...query };
    const response = await this.postRequest("session/export", newQuery);
    if (response.error) {
      return error(response.text);
    } else {
      const body = response.body;
      return ok(body as SessionExportResponse[]);
    }
  }

  async deleteSession(
    session: DeleteSessionRequest
  ): Promise<Result<unknown, string>> {
    const response = await this.postRequest("session/del", session);
    if (response.error) {
      return error(response.text);
    } else {
      return ok(response.text);
    }
  }

  private async postRequest(
    endpoint: string,
    requestData: Record<string, unknown>
  ) {
    await this.checkThrottle();

    const newRequestData = {
      ...requestData,
      api_key: this.configuration.schedApiKey,
    };
    const fullEndpoint = this.configuration.schedUri + endpoint;
    return superagent
      .post(fullEndpoint)
      .set("User-Agent", "madisonbikeweek2021-importer/1.0.0")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send(newRequestData);
  }

  private callCount = 0;
  private lastThrottleTime = 0;

  private async checkThrottle() {
    const savelastThrottleTime = this.lastThrottleTime;
    this.lastThrottleTime = Date.now();
    if (savelastThrottleTime < Date.now() - 30000) {
      // don't throttle if more than 30 seconds have elapsed
      this.callCount = 0;
      return;
    }
    this.callCount++;
    if (this.callCount % 15 == 0) {
      console.log("throttling api call, waiting 30 seconds");
      await sleep(30000);
    }
  }
}
