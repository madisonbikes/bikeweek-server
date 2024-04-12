import { eventModel } from "../database/events";
import { database } from "../database/database";
import { schedExporter } from "./schedExporter";
import { discountExporter } from "../discountExporter";
import { setTimeout, clearTimeout } from "timers";
import { configuration } from "../config";
import { logger } from "../utils";

/** handles sync to sched */
class EventSync {
  private cancelTimeout: NodeJS.Timeout | undefined;

  start(): Promise<void> {
    // launch initial trigger
    this.trigger();
    return Promise.resolve();
  }

  trigger() {
    if (this.cancelTimeout) {
      clearTimeout(this.cancelTimeout);
    }

    this.cancelTimeout = setTimeout(() => this.syncDoExport(), 5000);
  }

  triggerImmediate() {
    this.syncDoExport();
  }

  // bridge gap to async safely
  private syncDoExport() {
    if (!configuration.schedUri || !configuration.schedApiKey) {
      logger.warn("Skipping sched sync without URI and/or API key");
      return;
    }
    Promise.resolve(this.doExport())
      .then(() => logger.info("Successful sync to sched"))
      .catch((e) => logger.error(e));
  }

  private async doExport(): Promise<void> {
    const [status, allEvents] = await Promise.all([
      await database.getStatus(),
      await eventModel.events(),
    ]);

    // get list of events that need to be synced
    const filteredEvents = allEvents.filter((event) => {
      if (status.lastSchedSync === undefined) return true;
      return (
        event.createDate > status.lastSchedSync ||
        event.modifyDate > status.lastSchedSync
      );
    });

    await Promise.all([
      schedExporter.start(filteredEvents),
      discountExporter.start(allEvents),
    ]);

    await database.setStatus({ lastSchedSync: new Date() });
  }
}
export const eventSync = new EventSync();
