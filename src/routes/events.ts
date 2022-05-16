import { parseISO } from "date-fns";
import express from "express";
import { injectable } from "tsyringe";
import { EventModel } from "../database/events";
import { BikeWeekEvent } from "../database/types";
import { EventExporter } from "../eventExporter";
import { jwtMiddleware } from "../security/authentication";

@injectable()
export class EventRoutes {
  constructor(
    private eventModel: EventModel,
    private eventExporter: EventExporter
  ) {
    // trigger an export at startup to catch anything we might have missed?
    this.eventExporter.trigger();
  }

  readonly routes = express
    .Router()
    .get("/", jwtMiddleware, async (request, response) => {
      const events = await this.eventModel.events();
      response.send(events);
    })
    .get("/:eventId", jwtMiddleware, async (request, response) => {
      try {
        const id = parseInt(request.params.eventId);
        const event = await this.eventModel.findEvent(id);
        if (!event) {
          response.status(404).send("not found");
        } else {
          response.send(event);
        }
      } catch (err) {
        response.status(400).send("invalid request");
      }
    })
    .put("/:eventId", jwtMiddleware, async (request, response) => {
      try {
        const eventData: Partial<BikeWeekEvent> = this.normalizeEvent(
          request.body
        );
        const id = parseInt(request.params.eventId);
        eventData.modifyDate = new Date();
        const event = await this.eventModel.updateEvent(id, eventData);
        if (!event) {
          response.status(404).send("not found");
        } else {
          response.send(event);

          // trigger an export on any modification
          this.eventExporter.trigger();
        }
      } catch (err) {
        response.status(400).send("invalid request");
      }
    })
    .delete("/:eventId", jwtMiddleware, async (request, response) => {
      try {
        const id = parseInt(request.params.eventId);
        const event = await this.eventModel.deleteEvent(id);
        if (!event) {
          response.status(404).send("not found");
        } else {
          response.send("ok");

          // trigger an export on any modification
          this.eventExporter.trigger();
        }
      } catch (err) {
        response.status(400).send("invalid request");
      }
    });

  normalizeEvent = (event: Partial<BikeWeekEvent>): Partial<BikeWeekEvent> => {
    if (event.createDate) {
      event.createDate = parseISO(event.createDate as unknown as string);
    }

    if (event.modifyDate) {
      event.modifyDate = parseISO(event.modifyDate as unknown as string);
    }

    // days come as array of strings, we want array of dates
    if (event.eventDays) {
      const days = event.eventDays as unknown as string[];
      event.eventDays = days.map((v) => parseISO(v));
    }
    return event;
  };
}
