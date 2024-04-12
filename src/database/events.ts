import { EventTypes } from "../gravityforms/processor";
import { BikeWeekEvent, MutateBikeWeekEvent } from "../routes/contract";
import { database } from "./database";
import { DbBikeWeekEvent, dbBikeWeekEventSchema } from "./types";

export const isDiscountEvent = (event: DbBikeWeekEvent) => {
  return event.eventTypes.includes(EventTypes.DISCOUNT);
};

export const isEndOfWeekParty = (event: DbBikeWeekEvent) => {
  return (
    event.eventTypes.includes(EventTypes.ENDOFWEEKPARTY) &&
    event.eventTypes.length === 1
  );
};

export const isAllDayEvent = (event: DbBikeWeekEvent) => {
  return event.eventTimes.length === 0;
};

class EventModel {
  addEvent = async (event: DbBikeWeekEvent) => {
    await database.events.insertOne(event);
  };

  setAllEvents = async (events: DbBikeWeekEvent[]) => {
    await database.events.deleteMany({});
    if (events.length > 0) {
      await database.events.insertMany(events);
    }
  };

  events = async () => {
    return dbBikeWeekEventSchema
      .array()
      .parse(await database.events.find({}).toArray());
  };

  findEvent = async (id: number) => {
    const retval = await database.events.findOne({
      id,
    });
    if (!retval) return undefined;
    return dbBikeWeekEventSchema.parse(retval);
  };

  deleteEvent = async (id: number) => {
    const result = await database.events.deleteOne({ id });
    return result.deletedCount !== 0;
  };

  updateEvent = async (id: number, data: Partial<MutateBikeWeekEvent>) => {
    const modData: Partial<BikeWeekEvent> = { modifyDate: new Date(), ...data };
    const result = await database.events.updateOne(
      {
        id,
      },
      { $set: modData },
    );
    if (!result.acknowledged || result.matchedCount === 0) {
      return undefined;
    }
    return this.findEvent(id);
  };
}

export const eventModel = new EventModel();
