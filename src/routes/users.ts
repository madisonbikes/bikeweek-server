import express from "express";
import { injectable } from "tsyringe";
import { UserModel } from "../database/users";
import { jwtMiddleware } from "../security/authentication";
import * as yup from "yup";
import { validateSchema } from "../security/validateSchema";
import { verifyAdmin } from "../security/validateAdmin";

const userSchema = yup.object({
  username: yup.string().required(),
  admin: yup.boolean().default(false),
});

const userArraySchema = yup.array(userSchema);

const userWithPasswordSchema = userSchema.shape({
  password: yup.string().required(),
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
        const newUser = userWithPasswordSchema.cast(request.validated);

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
      const adaptedUsers = await userArraySchema.validate(users, {
        stripUnknown: true,
      });
      response.send(adaptedUsers);
    });
}
