import { injectable } from "tsyringe";
import { Importer } from "./gravityforms/importer";
import { SchedExporter } from "./sched/schedExporter";
import { createHash } from "crypto";
import { BikeWeekEvent } from "./event_types";
import { Configuration } from "./config";
import { setIntervalAsync } from "set-interval-async/dynamic";
import { DiscountExporter } from "./discountExporter";
import { Database } from "./database";
import { ApiServer } from "./server";

@injectable()
export class MainProcess {
  constructor(
    private importer: Importer,
    private schedExporter: SchedExporter,
    private discountExporter: DiscountExporter,
    private configuration: Configuration,
    private database: Database,
    private server: ApiServer,
  ) {}

  async start(): Promise<void> {
    await this.database.start()
    await this.server.start()

    if (!this.configuration.executeOnce) {
      // defaults to every hour
      console.log(
        `Scheduling poll of form data for every ${
          this.configuration.pollInterval / 1000
        } seconds`
      );
      setIntervalAsync(() => this.doImport(), this.configuration.pollInterval);
    }
    return this.doImport();
  }

  /** perform the import if form data has been updated or if it's the first execution */
  private async doImport(): Promise<void> {
    console.log("running import/export");
    const importedEvents = await this.importer.import();
    if (this.isUpdated(importedEvents)) {
      await Promise.all([
        await this.schedExporter.start(importedEvents),
        await this.discountExporter.start(importedEvents),
      ]);
      console.log("done");
    } else {
      console.log("done, form data not updated");
    }
  }

  private lastCount = -1;
  private lastHash = "";

  /** check if form data is updated by looking at event count + last modified hash */
  private isUpdated(events: BikeWeekEvent[]) {
    const hash = createHash("sha1");
    for (const e of events) {
      hash.update(e.modifyDate ?? "");
    }
    const calculatedHash = hash.digest("base64");
    const updated =
      calculatedHash != this.lastHash || this.lastCount != events.length;
    this.lastCount = events.length;
    this.lastHash = calculatedHash;
    return updated;
  }
}
