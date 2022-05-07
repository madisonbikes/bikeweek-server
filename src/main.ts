import { injectable } from "tsyringe";
import { Database } from "./database/database";
import { ApiServer } from "./server";
import { EventPoller } from "./eventPoller";

@injectable()
export class MainProcess {
  constructor(
    private database: Database,
    private server: ApiServer,
    private eventPoller: EventPoller
  ) {}

  async start(): Promise<void> {
    await this.database.start();
    await this.server.start();
    // FIXME temporary disable event polling
    //await this.eventPoller.start();
  }
}
