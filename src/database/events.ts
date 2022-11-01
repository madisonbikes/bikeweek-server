import { injectable } from "tsyringe";
import { EventTypes } from "../gravityforms/processor";
import { Database } from "./database";
import { BikeWeekEventSchema, BikeWeekEvent } from "./types";

export const isDiscountEvent = (event: BikeWeekEvent): boolean => {
  return event.eventTypes.includes(EventTypes.DISCOUNT);
};

export const isEndOfWeekParty = (event: BikeWeekEvent): boolean => {
  return event.eventTypes.includes(EventTypes.ENDOFWEEKPARTY);
};

export const isAllDayEvent = (event: BikeWeekEvent): boolean => {
  return event.eventTimes.length === 0;
};

@injectable()
export class EventModel {
  constructor(private database: Database) {}

  addEvent = async (event: BikeWeekEvent): Promise<void> => {
    await this.database.events.insertOne(event);
  };

  setAllEvents = async (events: BikeWeekEvent[]): Promise<void> => {
    await this.database.events.deleteMany({});
    await this.database.events.insertMany(events);
  };

  events = (): Promise<BikeWeekEvent[]> => {
    return BikeWeekEventSchema.array().parseAsync(
      this.database.events.find({}).toArray()
    );
  };

  findEvent = async (id: number): Promise<BikeWeekEvent | undefined> => {
    const retval = await this.database.events.findOne({
      id: `${id}`,
    });
    if (!retval) return undefined;
    return BikeWeekEventSchema.parseAsync(retval);
  };

  deleteEvent = async (id: number): Promise<boolean> => {
    const result = await this.database.events.deleteOne({ id: `${id}` });
    return result.deletedCount !== 0;
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
    if (!result.acknowledged || result.matchedCount === 0) {
      return undefined;
    }
    return this.findEvent(id);
  };
}
