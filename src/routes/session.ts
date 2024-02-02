import express from "express";
import { StatusCodes } from "http-status-codes";
import { injectable } from "tsyringe";
import {
  validateBodySchema,
  validateAuthenticated,
  localMiddleware,
  finalizeAuthenticationMiddleware,
} from "../security";
import { authenticatedUserSchema, loginBodySchema } from "./contract";
import { FederatedSecurityRoutes } from "./federated";

@injectable()
export class SessionRoutes {
  readonly routes;

  constructor(private federatedRoutes: FederatedSecurityRoutes) {
    this.routes = express
      .Router()
      .use(this.federatedRoutes.routes)
      .post(
        "/login",
        validateBodySchema({ schema: loginBodySchema }),
        localMiddleware,
        finalizeAuthenticationMiddleware,
      )
      .post("/logout", (request, response, next) => {
        if (request.user == null) {
          response.status(StatusCodes.UNAUTHORIZED).send("not logged in");
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
        response.send(authenticatedUserSchema.parse(request.user));
      });
  }
}
