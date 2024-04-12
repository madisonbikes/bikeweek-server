import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedUser, authenticatedUserSchema } from "../routes/contract";
import { DbUser } from "../database/types";
import { STRATEGY_NAME as LOCAL_STRATEGY_NAME, localStrategy } from "./local";
import {
  federatedStrategy,
  STRATEGY_NAME as FEDERATED_STRATEGY_NAME,
} from "./federated";

export type AuthenticatedExpressUser = Express.User & AuthenticatedUser;

export type ExpressMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => void;

export enum Roles {
  ADMIN = "admin",
  EDITOR = "editor",
}

export const userHasRole = (user: AuthenticatedUser, role: string) => {
  return user.roles?.find((r) => r === role) !== undefined;
};

export const localMiddleware: ExpressMiddleware = passport.authenticate(
  LOCAL_STRATEGY_NAME,
  {
    session: true,
    failWithError: false,
  },
) as ExpressMiddleware;

export const federatedMiddleware: ExpressMiddleware = passport.authenticate(
  FEDERATED_STRATEGY_NAME,
  {
    session: true,
    failWithError: false,
  },
) as ExpressMiddleware;

export const finalizeAuthenticationMiddleware: ExpressMiddleware = (
  request,
  response,
) => {
  const user = request.user as AuthenticatedUser;
  response.send(user);
};

class AuthenticationStrategies {
  registerPassportStrategies = () => {
    // used for login method
    passport.use(localStrategy);
    if (federatedStrategy.enabled) {
      passport.use(federatedStrategy);
    }
  };
}
export const authenticationStrategies = new AuthenticationStrategies();

/** sanitizes user info for export to passport and into request object */
export const buildAuthenticatedUser = (user: DbUser) => {
  // map ObjectId to string for _id to id
  const mappedUser = { id: user._id.toString(), ...user };
  return authenticatedUserSchema.parse(mappedUser);
};
