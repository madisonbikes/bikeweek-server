import { injectable, singleton } from "tsyringe";
import { EventModel } from "./database/events";
import { Database } from "./database/database";
import { SchedExporter } from "./sched/schedExporter";
import { DiscountExporter } from "./discountExporter";
import { setTimeout, clearTimeout } from "timers";

@injectable()
@singleton()
export class EventExporter {
  constructor(
    private database: Database,
    private schedExporter: SchedExporter,
    private discountExporter: DiscountExporter,
    private eventModel: EventModel
  ) {}

  private cancelTimeout: NodeJS.Timeout | undefined;

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
    Promise.resolve(this.doExport())
      .then(() => console.log("Successful sync to sched"))
      .catch((e) => console.log(e));
  }

  private async doExport(): Promise<void> {
    const [status, allEvents] = await Promise.all([
      await this.database.getStatus(),
      await this.eventModel.events(),
    ]);

    // get list of events that need to be synced
    const filteredEvents = allEvents.filter((event) => {
      if (!status.lastSchedSync) return true;
      return (
        event.createDate > status.lastSchedSync ||
        event.modifyDate > status.lastSchedSync
      );
    });

    await Promise.all([
      this.schedExporter.start(filteredEvents),
      this.discountExporter.start(allEvents),
    ]);

    await this.database.setStatus({ lastSchedSync: new Date() });
  }
}
