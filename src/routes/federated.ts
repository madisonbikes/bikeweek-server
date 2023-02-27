import { injectable } from "tsyringe";
import express from "express";
import {
  federatedMiddleware,
  finalizeAuthenticationMiddleware,
  validateBodySchema,
} from "../security";
import { federatedLoginBodySchema } from "./contract";
import { FederatedStrategy } from "../security/federated";

@injectable()
export class FederatedSecurityRoutes {
  constructor(federatedStrategy: FederatedStrategy) {
    this.routes = express.Router();

    // only enable route if necessary
    if (federatedStrategy.enabled) {
      this.routes.post(
        "/federated/login",
        validateBodySchema({ schema: federatedLoginBodySchema }),
        federatedMiddleware,
        finalizeAuthenticationMiddleware
      );
    }
  }
  readonly routes;
}
