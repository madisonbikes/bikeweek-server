import express from "express";
import { injectable } from "tsyringe";
import {
  validateBodySchema,
  validateAuthenticated,
  localMiddleware,
  finalizeAuthenticationMiddleware,
} from "../security";
import { loginBodySchema } from "./contract";
import { FederatedSecurityRoutes } from "./federated";

@injectable()
export class SessionRoutes {
  constructor(private federatedRoutes: FederatedSecurityRoutes) {}
  readonly routes = express
    .Router()
    .use(this.federatedRoutes.routes)
    .post(
      "/login",
      validateBodySchema({ schema: loginBodySchema }),
      localMiddleware,
      finalizeAuthenticationMiddleware
    )
    .post("/logout", (request, response, next) => {
      if (request.user == null) {
        response.status(400).send("not logged in");
      } else {
        request.logout((err) => {
          if (err !== undefined) {
            return next(err);
          } else {
            response.send("logged out");
          }
        });
      }
    })
    .get("/info", validateAuthenticated(), (request, response) => {
      response.send(request.user);
    });
}
