import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { logger } from "../utils";
import { ExpressMiddleware } from "./authentication";

type ValidateOptions<T extends z.ZodTypeAny> = {
  schema: T;
};

/** validate the request body against the supplied schema, placing validated object into the request.validated property */
export const validateBodySchema = <T extends z.ZodTypeAny>({
  schema,
}: ValidateOptions<T>): ExpressMiddleware => {
  return (request, response, next) => {
    logger.trace(request.body, "validating body schema");
    const parseResult = schema.safeParse(request.body);
    if (parseResult.success) {
      request.validated = parseResult.data;
      next();
    } else {
      request.validated = undefined;
      logger.debug(parseResult.error.issues, "invalid body");
      response.status(StatusCodes.BAD_REQUEST).send(parseResult.error.issues);
    }
  };
};

/** validate the request query against the supplied schema, placing validated object into the request.validated property */
export const validateQuerySchema = <T extends z.ZodTypeAny>({
  schema,
}: ValidateOptions<T>): ExpressMiddleware => {
  return (request, response, next) => {
    logger.debug("validating query schema");
    const parseResult = schema.safeParse(request.query);
    if (parseResult.success) {
      request.validated = parseResult.data;
      next();
    } else {
      logger.debug(parseResult.error.issues, "invalid query");
      request.validated = undefined;
      response.status(StatusCodes.BAD_REQUEST).send(parseResult.error.issues);
    }
  };
};
