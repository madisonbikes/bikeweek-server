import express from "express";
import { injectable } from "tsyringe";
import { AuthenticatedUser, jwtMiddleware } from "../security/authentication";

@injectable()
export class InfoRoutes {
  readonly routes = express
    .Router()
    .get("/info", jwtMiddleware, (request, response) => {
      const authUser = request.user as AuthenticatedUser;
      response.json(authUser);
    });
}
