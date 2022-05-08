import express from "express";
import { injectable } from "tsyringe";
import { User, UserModel } from "../database/user";
import jwt from "jsonwebtoken";
import { Configuration } from "../config";

@injectable()
export class UserRoutes {
  constructor(
    private userModel: UserModel,
    private configuration: Configuration
  ) {}

  routes = express.Router().post("/create", async (request, response) => {
    const authorizationHeader = request.get("Authorization");
    if (!authorizationHeader) {
      response.status(401).send("unauthorized");
      return;
    }
    if (!authorizationHeader.startsWith("Bearer ")) {
      response.status(401).send("unauthorized");
      return;
    }
    const jwtToken = authorizationHeader.substring(7);
    try {
      const verifiedToken = jwt.verify(
        jwtToken,
        this.configuration.jsonWebTokenSecret
      );

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
    } catch (err) {
      response.status(401).send("unauthorized");
      return;
    }
  });
}
