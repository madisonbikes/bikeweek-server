import express from "express";
import { injectable } from "tsyringe";
import { UserModel } from "../database/users";
import { validateBodySchema } from "../security/validateSchema";
import { validateAdmin } from "../security/validateAdmin";
import {
  userSchema,
  UserWithPassword,
  userWithPasswordSchema,
} from "./contract";
import { asyncWrapper } from "./async";
import { validateAuthenticated, generateHashedPassword } from "../security";

@injectable()
export class UserRoutes {
  constructor(private userModel: UserModel) {}

  readonly routes = express
    .Router()
    .post(
      "/create",
      validateAdmin(),
      validateBodySchema({ schema: userWithPasswordSchema }),
      asyncWrapper(async (request, response) => {
        const newUser = request.validated as UserWithPassword;

        if ((await this.userModel.findUser(newUser.username)) !== undefined) {
          response.status(409).send("user already exists");
          return;
        }

        const hashed_password = await generateHashedPassword(newUser.password);
        const createdUser = await this.userModel.addUser({
          ...newUser,
          hashed_password,
        });
        response.send(createdUser);
      })
    )
    .get(
      "/",
      validateAuthenticated(),
      asyncWrapper(async (_request, response) => {
        const users = await this.userModel.users();
        const adaptedUsers = userSchema.array().parse(users);
        response.send(adaptedUsers);
      })
    );
}
