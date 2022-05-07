import express from "express";
import { injectable } from "tsyringe";

import { UserModel } from "../database/user";

@injectable()
export class LoginRoutes {
  constructor(private userModel: UserModel) {}
  routes = express.Router().post("/login", async (request, response) => {
    const { username, password } = request.body;
    if (!username || !password) {
      response.status(500).send("error missing username and/or password");
      return;
    }

    let success = false;
    const user = await this.userModel.findUser(username);
    if (user) {
      success = await this.userModel.checkPassword(password, user);
    }
    if (!success) {
      response.status(404).send("invalid username and/or password");
    } else {
      response.send(user);
    }
  });
}
