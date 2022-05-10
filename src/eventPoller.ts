import { injectable } from "tsyringe";
import { setIntervalAsync } from "set-interval-async/dynamic";
import { Configuration } from "./config";
import { Importer } from "./gravityforms/importer";
import { Processor } from "./gravityforms/processor";
import { createHash } from "crypto";
import { BikeWeekEvent, EventModel, EventStatus } from "./database/event";
import { SchedExporter } from "./sched/schedExporter";
import { DiscountExporter } from "./discountExporter";

@injectable()
export class EventPoller {
  constructor(
    private configuration: Configuration,
    private importer: Importer,
    private processor: Processor,
    private eventModel: EventModel,
    private schedExporter: SchedExporter,
    private discountExporter: DiscountExporter
  ) {}

  async start() {
    await this.importer.import();

    // defaults to every hour
    console.log(
      `Scheduling poll of form data for every ${
        this.configuration.pollInterval / 1000
      } seconds`
    );
    await this.doImport();
    setIntervalAsync(() => this.doImport(), this.configuration.pollInterval);
  }

  /** perform the import if form data has been updated or if it's the first execution */
  private async doImport(): Promise<void> {
    console.log("running import/export");
    await this.importer.import();

    const importedEvents = await this.processor.extractEvents();
    this.eventModel.setAllEvents(importedEvents);

    if (this.isUpdated(importedEvents)) {
      //await Promise.all([
      //await this.schedExporter.start(importedEvents),
      //await this.discountExporter.start(importedEvents),
      //]);
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
