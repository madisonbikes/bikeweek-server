import express from "express";
import { injectable } from "tsyringe";
import { MutableBikeWeekEvent, mutableBikeWeekEventSchema } from "./contract";
import { EventModel } from "../database/events";
import { EventSync } from "../sched/sync";
import { jwtMiddleware } from "../security/authentication";
import { validateAdmin } from "../security/validateAdmin";
import { logger } from "../utils";
import { validateBodySchema } from "../security/validateSchema";
import { asyncWrapper } from "./async";

@injectable()
export class EventRoutes {
  constructor(
    private eventModel: EventModel,
    private eventExporter: EventSync
  ) {}

  readonly routes = express
    .Router()
    .get(
      "/",
      jwtMiddleware,
      validateAdmin(),
      asyncWrapper(async (_request, response) => {
        const events = await this.eventModel.events();
        response.send(events);
      })
    )
    .get(
      "/:eventId",
      jwtMiddleware,
      validateAdmin(),
      asyncWrapper(async (request, response) => {
        try {
          const id = parseInt(request.params.eventId);
          const event = await this.eventModel.findEvent(id);
          if (!event) {
            response.status(404).send("not found");
          } else {
            response.send(event);
          }
        } catch (err) {
          logger.error(err);
          response.status(400).send("invalid request");
        }
      })
    )
    .put(
      "/:eventId",
      jwtMiddleware,
      validateAdmin(),
      validateBodySchema({ schema: mutableBikeWeekEventSchema }),
      asyncWrapper(async (request, response) => {
        try {
          const eventData = request.validated as MutableBikeWeekEvent;
          const id = parseInt(request.params.eventId);
          const event = await this.eventModel.updateEvent(id, eventData);
          if (!event) {
            response.status(404).send("not found");
          } else {
            response.send(event);

            // trigger an export on any modification
            this.eventExporter.trigger();
          }
        } catch (err) {
          logger.error(err);
          response.status(400).send("invalid request");
        }
      })
    )
    .delete(
      "/:eventId",
      jwtMiddleware,
      validateAdmin(),
      asyncWrapper(async (request, response) => {
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
          logger.error(err);
          response.status(400).send("invalid request");
        }
      })
    );
}
