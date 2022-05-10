import express from "express";
import { injectable } from "tsyringe";
import { BikeWeekEvent, EventModel } from "../database/event";
import { jwtMiddleware } from "../security/authentication";

@injectable()
export class EventRoutes {
  constructor(private eventModel: EventModel) {}

  readonly routes = express
    .Router()
    .get("/", jwtMiddleware, async (request, response) => {
      response.send(await this.eventModel.events());
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
        const eventData: Partial<BikeWeekEvent> = request.body;
        const id = parseInt(request.params.eventId);
        const event = await this.eventModel.updateEvent(id, eventData);
        if (!event) {
          response.status(404).send("not found");
        } else {
          response.send(event);
        }
      } catch (err) {
        response.status(400).send("invalid request");
      }
    });
}
