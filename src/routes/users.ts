import express from "express";
import { injectable } from "tsyringe";
import { UserModel } from "../database/users";
import { jwtMiddleware } from "../security/authentication";
import { z } from "zod";
import { validateSchema } from "../security/validateSchema";
import { verifyAdmin } from "../security/validateAdmin";

const userSchema = z.object({
  username: z.string(),
  admin: z.boolean().default(false),
});

const userArraySchema = z.array(userSchema);

const userWithPasswordSchema = userSchema.extend({
  password: z.string(),
});

@injectable()
export class UserRoutes {
  constructor(private userModel: UserModel) {}

  readonly routes = express
    .Router()
    .post(
      "/create",
      jwtMiddleware,
      verifyAdmin,
      validateSchema(userWithPasswordSchema),
      async (request, response) => {
        const newUser = userWithPasswordSchema.parse(request.validated);

        if (await this.userModel.findUser(newUser.username)) {
          response.status(409).send("user already exists");
          return;
        }

        const createdUser = await this.userModel.addUser(newUser);
        response.send(createdUser);
      }
    )
    .get("/", jwtMiddleware, async (request, response) => {
      const users = await this.userModel.users();
      const adaptedUsers = userArraySchema.parse(users);
      response.send(adaptedUsers);
    });
}
