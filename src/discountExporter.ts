import { injectable } from "tsyringe";
import { isAllDayEvent, isDiscountEvent } from "./database/events";
import fs from "fs/promises";
import { BikeWeekEvent } from "./database/types";

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

      buffer += `<h2>${link}</h2>\n`;
      if (location?.maps_description) {
        // do something
      }
    }

    await fs.mkdir("output", { recursive: true });
    await fs.writeFile("output/discounts.html", buffer);
  }
}

const createLink = (text: string, url: string | undefined) => {
  if (url?.trim() === "") {
    return text;
  } else {
    return `<a href="${url}">${text}</a>`;
  }
};
