import express from "express";
import { injectable } from "tsyringe";
import { BikeWeekEvent, EventTimestampSchema } from "../api/event";
import { EventModel } from "../database/events";
import { EventSync } from "../sched/sync";
import { jwtMiddleware } from "../security/authentication";
import { verifyAdmin } from "../security/validateAdmin";

@injectable()
export class EventRoutes {
  constructor(
    private eventModel: EventModel,
    private eventExporter: EventSync
  ) {}

  readonly routes = express
    .Router()
    .get("/", jwtMiddleware, verifyAdmin, async (_request, response) => {
      const events = await this.eventModel.events();
      response.send(events);
    })
    .get("/:eventId", jwtMiddleware, verifyAdmin, async (request, response) => {
      try {
        const id = parseInt(request.params.eventId);
        const event = await this.eventModel.findEvent(id);
        if (!event) {
          response.status(404).send("not found");
        } else {
          response.send(event);
        }
      } catch (err) {
        console.log(err);
        response.status(400).send("invalid request");
      }
    })
    .put("/:eventId", jwtMiddleware, verifyAdmin, async (request, response) => {
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
        console.log(err);
        response.status(400).send("invalid request");
      }
    })
    .delete(
      "/:eventId",
      jwtMiddleware,
      verifyAdmin,
      async (request, response) => {
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
          console.log(err);
          response.status(400).send("invalid request");
        }
      }
    );

  normalizeEvent = (event: Partial<BikeWeekEvent>): Partial<BikeWeekEvent> => {
    if (event.createDate) {
      event.createDate = EventTimestampSchema.parse(event.createDate);
    }

    if (event.modifyDate) {
      event.modifyDate = EventTimestampSchema.parse(event.modifyDate);
    }

    if (event.location) {
      if (event.location.sched_address?.trim() === "") {
        event.location.sched_address = undefined;
      }
      if (event.location.sched_venue?.trim() === "") {
        event.location.sched_venue = undefined;
      }
      if (event.location.maps_query?.trim() === "") {
        event.location.maps_query = undefined;
      }
      if (event.location.maps_placeid?.trim() === "") {
        event.location.maps_placeid = undefined;
      }
      if (event.location.maps_description?.trim() === "") {
        event.location.maps_description = undefined;
      }
    }

    if (event.eventUrl?.trim() === "") {
      event.eventUrl = undefined;
    }

    if (event.eventGraphicUrl?.trim() === "") {
      event.eventGraphicUrl = undefined;
    }
    return event;
  };
}
