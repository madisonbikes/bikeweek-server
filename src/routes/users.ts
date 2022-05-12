import express from "express";
import { injectable } from "tsyringe";
import { User, UserModel } from "../database/users";
import { jwtMiddleware } from "../security/authentication";

@injectable()
export class UserRoutes {
  constructor(private userModel: UserModel) {}

  readonly routes = express
    .Router()
    .post("/create", jwtMiddleware, async (request, response) => {
      const newUser = request.body as User;
      if (!newUser.username || !newUser.password) {
        response.status(500).send("error");
        return;
      }

      if (await this.userModel.findUser(newUser.username)) {
        response.status(500).send("user already exists");
        return;
      }

      const createdUser = await this.userModel.addUser(newUser);
      response.send(createdUser);
    });
}
