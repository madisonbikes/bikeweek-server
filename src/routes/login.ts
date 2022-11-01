import express from "express";
import { injectable } from "tsyringe";
import { AuthenticatedUser, localMiddleware } from "../security/authentication";
import { z } from "zod";
import { validateSchema } from "../security/validateSchema";
import { JwtManager } from "../security/jwt";

const loginSchema = z
  .object({
    username: z.string(),
    password: z.string(),
  })
  .strict();

@injectable()
export class LoginRoutes {
  constructor(private jwtManager: JwtManager) {}
  readonly routes = express
    .Router()
    .post(
      "/login",
      validateSchema(loginSchema),
      localMiddleware,
      (request, response) => {
        const user = request.user as AuthenticatedUser;
        const token = this.jwtManager.sign(user);
        response.send(token);
      }
    );
}
