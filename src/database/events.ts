import { injectable } from "tsyringe";
import { EventTypes } from "../gravityforms/processor";
import { BikeWeekEvent, MutableBikeWeekEvent } from "../routes/contract";
import { Database } from "./database";
import { DbBikeWeekEvent, dbBikeWeekEventSchema } from "./types";

export const isDiscountEvent = (event: DbBikeWeekEvent) => {
  return event.eventTypes.includes(EventTypes.DISCOUNT);
};

export const isEndOfWeekParty = (event: DbBikeWeekEvent) => {
  return event.eventTypes.includes(EventTypes.ENDOFWEEKPARTY);
};

export const isAllDayEvent = (event: DbBikeWeekEvent) => {
  return event.eventTimes.length === 0;
};

@injectable()
export class EventModel {
  constructor(private database: Database) {}

  addEvent = async (event: DbBikeWeekEvent) => {
    await this.database.events.insertOne(event);
  };

  setAllEvents = async (events: DbBikeWeekEvent[]) => {
    await this.database.events.deleteMany({});
    await this.database.events.insertMany(events);
  };

  events = async () => {
    return dbBikeWeekEventSchema
      .array()
      .parse(await this.database.events.find({}).toArray());
  };

  findEvent = async (id: number) => {
    const retval = await this.database.events.findOne({
      id,
    });
    if (!retval) return undefined;
    return dbBikeWeekEventSchema.parse(retval);
  };

  deleteEvent = async (id: number) => {
    const result = await this.database.events.deleteOne({ id });
    return result.deletedCount !== 0;
  };

  updateEvent = async (id: number, data: Partial<MutableBikeWeekEvent>) => {
    const modData: Partial<BikeWeekEvent> = { modifyDate: new Date(), ...data };
    const result = await this.database.events.updateOne(
      {
        id,
      },
      { $set: modData }
    );
    if (!result.acknowledged || result.matchedCount === 0) {
      return undefined;
    }
    return this.findEvent(id);
  };
}
