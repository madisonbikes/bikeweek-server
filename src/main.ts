import { injectable } from "tsyringe";
import { Importer } from "./gravityforms/importer";
import { Exporter } from "./sched/exporter";
import { createHash } from "crypto";
import { BikeWeekEvent } from "./event_types";
import { Configuration } from "./config";
import { setIntervalAsync } from "set-interval-async/dynamic";

@injectable()
export class MainProcess {
  constructor(
    private importer: Importer,
    private exporter: Exporter,
    public configuration: Configuration
  ) {}

  async start(): Promise<void> {
    if(!this.configuration.executeOnce) {
      console.log(`Scheduling poll of form data for every ${this.configuration.pollInterval/1000} seconds`)
      setIntervalAsync(
        () => this.doImport(),
        this.configuration.pollInterval
      );
    }
    return this.doImport();
  }

  /** perform the import if form data has been updated or if it's the first execution */
  private async doImport(): Promise<void> {
    console.log("running import/export");
    const importedEvents = await this.importer.import();
    if (this.isUpdated(importedEvents)) {
      await this.exporter.start(importedEvents);
      console.log("done")
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