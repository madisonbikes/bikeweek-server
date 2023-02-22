import express from "express";
import { injectable } from "tsyringe";
import { Configuration } from "../config";
import {
  finalizeAuthenticationMiddleware,
  googleMiddleware,
  validateBodySchema,
} from "../security";
import { federatedGoogleAuthBodySchema } from "./contract";

@injectable()
export class GoogleRoutes {
  constructor(private config: Configuration) {}

  isEnabled() {
    return Boolean(this.config.googleAuthClientId);
  }

  readonly routes = express
    .Router()
    .post(
      "/login",
      validateBodySchema({ schema: federatedGoogleAuthBodySchema }),
      googleMiddleware,
      finalizeAuthenticationMiddleware
    );
}
