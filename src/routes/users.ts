import express from "express";
import { injectable } from "tsyringe";
import { User, UserModel } from "../database/user";

@injectable()
export class UserRoutes {
  constructor(private userModel: UserModel) {}

  routes = express.Router().post("/create", async (request, response) => {
    const user: User = request.body;
    if (!user.username || !user.password) {
      response.status(500).send("error");
      return;
    }

    if (await this.userModel.findUser(user.username)) {
      response.status(500).send("user already exists");
      return;
    }

    const newUser = await this.userModel.addUser(user);
    response.send(newUser);
  });
}
