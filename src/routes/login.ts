import express from "express";
import { injectable } from "tsyringe";
import { AuthenticatedUser, localMiddleware } from "../security/authentication";
import { validateBodySchema } from "../security/validateSchema";
import { JwtManager } from "../security/jwt";
import { loginRequestSchema, LoginResponse } from "./contract";

@injectable()
export class LoginRoutes {
  constructor(private jwtManager: JwtManager) {}
  readonly routes = express
    .Router()
    .post(
      "/login",
      validateBodySchema({ schema: loginRequestSchema }),
      localMiddleware,
      (request, response) => {
        const user = request.user as AuthenticatedUser;
        const token = this.jwtManager.sign(user);
        const lr: LoginResponse = { jwtToken: token };
        response.send(lr);
      }
    );
}
