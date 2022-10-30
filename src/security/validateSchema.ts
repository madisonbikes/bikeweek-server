import { Request, Response, NextFunction } from "express";
import { z } from "zod";

type Middleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<void>;

/** validate the request against the supplied yup schema, placing validated object into the request.validated property */
export const validateSchema = <T extends z.ZodTypeAny>(
  schema: T
): Middleware => {
  return (request, response, next) => {
    const body = request.body;
    const parseResult = schema.safeParse(body);
    if (parseResult.success) {
      next();
    } else {
      response.status(400).send(parseResult.error.issues);
    }
    return Promise.resolve();
  };
};
