import express from "express";
import { injectable } from "tsyringe";
import { Configuration } from "../config";
import passport from "passport";
import jwt from "jsonwebtoken";
import { AuthenticatedUser } from "../security/authentication";

@injectable()
export class LoginRoutes {
  constructor(private configuration: Configuration) {}
  readonly routes = express
    .Router()
    .post(
      "/login",
      passport.authenticate("local", { session: false }),
      async (request, response) => {
        const user = request.user as AuthenticatedUser;
        const token = jwt.sign(user, this.configuration.jsonWebTokenSecret);
        response.send(token);
      }
    );
}
