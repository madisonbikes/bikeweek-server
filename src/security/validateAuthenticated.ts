import { StatusCodes } from "http-status-codes";
import { AuthenticatedUser } from "../routes/contract";
import { logger } from "../utils";
import { ExpressMiddleware } from "./authentication";

export const validateAuthenticated = (): ExpressMiddleware => {
  return (request, response, next) => {
    logger.trace(request.user, "validating authenticated");
    const user = request.user as AuthenticatedUser;
    if (user === undefined) {
      response.status(StatusCodes.UNAUTHORIZED).send("requires authenticated");
    } else {
      next();
    }
  };
};
