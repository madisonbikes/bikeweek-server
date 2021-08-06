import { injectable } from "tsyringe";
import { BikeWeekEvent, isAllDayEvent, isDiscountEvent } from "./event_types";
import fs from "fs/promises";

@injectable()
export class DiscountExporter {
  async start(allEvents: BikeWeekEvent[]): Promise<void> {
    const events = [...allEvents]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((event) => isDiscountEvent(event) || isAllDayEvent(event));

    let buffer = "";
    for (const event of events) {
      const location = event.location;

      const link = createLink(event.name, event.eventUrl);
      const itemList = new Array<string>();

      buffer += `<h2>${link}</h2>\n`;
      if (location?.maps_description) {
        // do something
      }
    }

    await fs.mkdir("output", { recursive: true });
    await fs.writeFile("output/discounts.html", buffer);
  }
}

function createLink(text: string, url: string | undefined) {
  if (!url || url.trim().length == 0) {
    return text;
  } else {
    return `<a href="${url}">${text}</a>`;
  }
}