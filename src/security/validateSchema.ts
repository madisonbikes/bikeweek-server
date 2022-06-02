import { Request, Response, NextFunction } from "express";
import { Schema, ValidationError } from "yup";

type Middleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<void>;

/** validate the request against the supplied yup schema, placing validated object into the request.validated property */
export const validateSchema = <T>(schema: Schema<T>): Middleware => {
  return async (request, response, next) => {
    try {
      const body = request.body;
      request.validated = await schema.validate(body, { abortEarly: false });
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        response.status(400).send(err.errors);
      } else {
        console.log(err);
        response.status(400).send(err);
      }
    }
  };
};
