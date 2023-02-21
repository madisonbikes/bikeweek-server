import express from "express";
import { injectable } from "tsyringe";
import { Configuration } from "../config";
import { googleMiddleware, validateBodySchema } from "../security";
import { AuthenticatedUser, federatedGoogleAuthBodySchema } from "./contract";

@injectable()
export class GoogleRoutes {
  constructor(private config: Configuration) {}

  isEnabled() {
    return this.config.googleAuthClientId;
  }

  readonly routes = express
    .Router()
    .post(
      "/login",
      validateBodySchema({ schema: federatedGoogleAuthBodySchema }),
      googleMiddleware,
      (request, response) => {
        const user = request.user as AuthenticatedUser;
        response.send(user);
      }
    );
}
