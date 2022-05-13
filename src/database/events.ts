import { injectable } from "tsyringe";
import { EventTypes } from "../gravityforms/processor";
import { Database } from "./database";
import { BikeWeekEvent } from "./types";

export function isDiscountEvent(event: BikeWeekEvent): boolean {
  return event.eventTypes.includes(EventTypes.DISCOUNT);
}

export function isEndOfWeekParty(event: BikeWeekEvent): boolean {
  return event.eventTypes.includes(EventTypes.ENDOFWEEKPARTY);
}

export function isAllDayEvent(event: BikeWeekEvent): boolean {
  return event.eventTimes.length === 0;
}

@injectable()
export class EventModel {
  constructor(private database: Database) {}

  setAllEvents = async (events: BikeWeekEvent[]): Promise<void> => {
    await this.database.events.deleteMany({});
    await this.database.events.insertMany(events);
  };

  events = async (): Promise<BikeWeekEvent[]> => {
    return (await this.database.events
      .find({})
      .toArray()) as unknown as BikeWeekEvent[];
  };

  findEvent = async (id: number): Promise<BikeWeekEvent | undefined> => {
    return (await this.database.events.findOne({
      id: `${id}`,
    })) as unknown as BikeWeekEvent | undefined;
  };

  updateEvent = async (
    id: number,
    data: Partial<BikeWeekEvent>
  ): Promise<BikeWeekEvent | undefined> => {
    delete data["id"];
    const result = await this.database.events.updateOne(
      {
        id: `${id}`,
      },
      { $set: data }
    );
    if (!result.acknowledged || result.matchedCount == 0) {
      return undefined;
    }
    return this.findEvent(id);
  };
}
