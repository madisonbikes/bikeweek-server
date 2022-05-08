import express from "express";
import { injectable } from "tsyringe";
import jwt from "jsonwebtoken";
import { UserModel } from "../database/user";
import { Configuration } from "../config";

@injectable()
export class LoginRoutes {
  constructor(
    private userModel: UserModel,
    private configuration: Configuration
  ) {}
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
    if (!success || !user) {
      response.status(404).send("invalid username and/or password");
    } else {
      const token = jwt.sign(user, this.configuration.jsonWebTokenSecret);
      response.send(token);
    }
  });
}
