import express, { RequestHandler } from "express";

export const asyncWrapper = (
  fn: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => Promise<express.Response | void>,
): RequestHandler => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return (req, res, next) => {
    // eslint-disable-next-line promise/no-callback-in-promise
    return fn(req, res, next).catch(next);
  };
};
