import express from "express";
import { injectable } from "tsyringe";
import { UserModel } from "../database/users";
import { jwtMiddleware } from "../security/authentication";
import { validateBodySchema } from "../security/validateSchema";
import { validateAdmin } from "../security/validateAdmin";
import { userSchema, userWithPasswordSchema } from "./contract";
import { asyncWrapper } from "./async";

@injectable()
export class UserRoutes {
  constructor(private userModel: UserModel) {}

  readonly routes = express
    .Router()
    .post(
      "/create",
      jwtMiddleware,
      validateAdmin(),
      validateBodySchema({ schema: userWithPasswordSchema }),
      asyncWrapper(async (request, response) => {
        const newUser = userWithPasswordSchema.parse(request.validated);

        if (await this.userModel.findUser(newUser.username)) {
          response.status(409).send("user already exists");
          return;
        }

        const createdUser = await this.userModel.addUser(newUser);
        response.send(createdUser);
      })
    )
    .get(
      "/",
      jwtMiddleware,
      asyncWrapper(async (request, response) => {
        const users = await this.userModel.users();
        const adaptedUsers = userSchema.array().parse(users);
        response.send(adaptedUsers);
      })
    );
}
