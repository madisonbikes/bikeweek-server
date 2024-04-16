import express from "express";
import { MutateBikeWeekEvent, mutateBikeWeekEventSchema } from "./contract";
import { eventModel } from "../database/events";
import eventSync from "../sched/sync";
import { validateAdmin } from "../security/validateAdmin";
import { logger } from "../utils";
import { validateBodySchema } from "../security/validateSchema";
import { asyncWrapper } from "./async";
import { StatusCodes } from "http-status-codes";

function routes() {
  return express
    .Router()
    .get(
      "/",
      validateAdmin(),
      asyncWrapper(async (_request, response) => {
        const events = await eventModel.events();
        response.send(events);
      }),
    )
    .get(
      "/:eventId",
      validateAdmin(),
      asyncWrapper(async (request, response) => {
        try {
          const id = parseInt(request.params.eventId);
          const event = await eventModel.findEvent(id);
          if (!event) {
            response.status(StatusCodes.NOT_FOUND).send("not found");
          } else {
            response.send(event);
          }
        } catch (err) {
          logger.error(err);
          response.status(StatusCodes.BAD_REQUEST).send("invalid request");
        }
      }),
    )
    .put(
      "/:eventId",
      validateAdmin(),
      validateBodySchema({ schema: mutateBikeWeekEventSchema }),
      asyncWrapper(async (request, response) => {
        const eventData = request.validated as MutateBikeWeekEvent;
        const id = parseInt(request.params.eventId);
        const event = await eventModel.updateEvent(id, eventData);
        if (!event) {
          response.status(StatusCodes.NOT_FOUND).send("not found");
        } else {
          response.send(event);

          // trigger an export on any modification
          eventSync.trigger();
        }
      }),
    )
    .delete(
      "/:eventId",
      validateAdmin(),
      asyncWrapper(async (request, response) => {
        const id = parseInt(request.params.eventId);
        const event = await eventModel.deleteEvent(id);
        if (!event) {
          response.status(StatusCodes.NOT_FOUND).send("not found");
        } else {
          response.send("ok");

          // trigger an export on any modification
          eventSync.trigger();
        }
      }),
    );
}

export default { routes };
