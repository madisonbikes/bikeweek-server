import { injectable } from "tsyringe";
import { setIntervalAsync } from "set-interval-async/dynamic";
import { Configuration } from "../config";
import { Importer } from "./importer";
import { Processor } from "./processor";
import { createHash } from "crypto";
import { EventModel } from "../database/events";
import { BikeWeekEvent } from "../api/event";
import { logger } from "../utils/logger";

@injectable()
export class RemoteEventPoller {
  constructor(
    private configuration: Configuration,
    private importer: Importer,
    private processor: Processor,
    private eventModel: EventModel
  ) {}

  async start() {
    await this.importer.import();

    // defaults to every hour
    logger.info(
      `Scheduling poll of form data for every ${
        this.configuration.pollInterval / 1000
      } seconds`
    );
    await this.doImport();
    setIntervalAsync(() => this.doImport(), this.configuration.pollInterval);
  }

  /** perform the import if form data has been updated or if it's the first execution */
  private async doImport(): Promise<void> {
    logger.debug("running remote forms import");
    await this.importer.import();

    const importedEvents = await this.processor.extractEvents();
    let skipCount = 0,
      addCount = 0;
    for (const event of importedEvents) {
      const eventExists =
        (await this.eventModel.findEvent(event.id)) !== undefined;
      if (!eventExists) {
        addCount++;
        logger.debug(
          {
            event,
          },
          `Importing new event ${event.id}: "${event.name}" from remote forms`
        );
        await this.eventModel.addEvent(event);
      } else {
        skipCount++;
      }
    }
    logger.info(
      `Finished remote forms import, skipped ${skipCount} added ${addCount}`
    );
  }

  private lastCount = -1;
  private lastHash = "";

  /** check if form data is updated by looking at event count + last modified hash */
  private isUpdated(events: BikeWeekEvent[]) {
    const hash = createHash("sha1");
    for (const e of events) {
      hash.update(e.modifyDate.toUTCString() ?? "");
    }
    const calculatedHash = hash.digest("base64");
    const updated =
      calculatedHash !== this.lastHash || this.lastCount !== events.length;
    this.lastCount = events.length;
    this.lastHash = calculatedHash;
    return updated;
  }
}
