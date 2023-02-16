import { injectable } from "tsyringe";
import { Database } from "./database/database";
import { ApiServer } from "./server";
import { RemoteEventPoller } from "./gravityforms/poller";
import { EventSync } from "./sched/sync";
import { RedisConnection } from "./redis";

@injectable()
export class MainProcess {
  constructor(
    private database: Database,
    private redis: RedisConnection,
    private server: ApiServer,
    private eventPoller: RemoteEventPoller,
    private eventSync: EventSync
  ) {}

  async start(): Promise<void> {
    await this.database.start();
    await this.redis.start();
    await this.server.start();
    await this.eventPoller.start();
    await this.eventSync.start();
  }
}
