import express from "express";
import { injectable } from "tsyringe";
import { AuthenticatedUser, localMiddleware } from "../security/authentication";
import * as yup from "yup";
import { validateSchema } from "../security/validateSchema";
import { JwtManager } from "../security/jwt";

const schema = yup
  .object({
    username: yup.string().required(),
    password: yup.string().required(),
  })
  .noUnknown()
  .strict();

@injectable()
export class LoginRoutes {
  constructor(private jwtManager: JwtManager) {}
  readonly routes = express
    .Router()
    .post(
      "/login",
      validateSchema(schema),
      localMiddleware,
      (request, response) => {
        const user = request.user as AuthenticatedUser;
        const token = this.jwtManager.sign(user);
        response.send(token);
      }
    );
}
