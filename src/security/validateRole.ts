import { StatusCodes } from "http-status-codes";
import { AuthenticatedUser } from "../routes/contract";
import { logger } from "../utils";
import { ExpressMiddleware, Roles, userHasRole } from "./authentication";

type ValidateOptions = {
  role: Roles;
};

export const validateRole = ({ role }: ValidateOptions): ExpressMiddleware => {
  return (request, response, next) => {
    logger.trace(request.user, `validating role "${role}"`);
    const user = request.user as AuthenticatedUser;
    if (user === undefined || !userHasRole(user, role)) {
      response.status(StatusCodes.FORBIDDEN).send(`requires role "${role}"`);
    } else {
      next();
    }
  };
};
