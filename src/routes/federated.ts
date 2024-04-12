import express from "express";
import {
  federatedMiddleware,
  finalizeAuthenticationMiddleware,
  validateBodySchema,
} from "../security";
import { federatedLoginBodySchema } from "./contract";
import { federatedStrategy } from "../security/federated";

function routes() {
  const router = express.Router();

  // only enable route if necessary
  if (federatedStrategy.enabled) {
    router.post(
      "/federated/login",
      validateBodySchema({ schema: federatedLoginBodySchema }),
      federatedMiddleware,
      finalizeAuthenticationMiddleware,
    );
  }
  return router;
}
export default { routes };
