import { injectable } from "tsyringe";
import { Importer } from "./gravityforms/importer";
import { Exporter } from "./sched/exporter";

@injectable()
export class MainProcess {
  constructor(private importer: Importer, private exporter: Exporter) {}

  async start(): Promise<void> {
    const importedEvents = await this.importer.import();
    //await this.exporter.start(importedEvents)
  }
}