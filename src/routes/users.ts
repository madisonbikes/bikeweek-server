import express from "express";
import { injectable } from "tsyringe";
import { UserModel } from "../database/users";
import {
  AuthenticatedUser,
  mutateUserSchema,
  MutateUser,
  User,
  userSchema,
} from "./contract";
import { asyncWrapper } from "./async";
import {
  checkPassword,
  generateHashedPassword,
  validateAuthenticated,
  validateBodySchema,
} from "../security";
import { ObjectId } from "mongodb";
import { DbUser } from "../database/types";
import { logger } from "../utils";

@injectable()
export class UserRoutes {
  constructor(private userModel: UserModel) {}

  readonly routes = express
    .Router()
    /* ATTENTION! user creation not currently used by UI, no reason to enable it
    .post(
      "/",
      validateAdmin(),
      validateBodySchema({ schema: userWithPasswordSchema }),
      asyncWrapper(async (request, response) => {
        const newUser = request.validated as UserWithPassword;

        if (await this.userModel.findUserByUsername(newUser.username)) {
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
    */

    /** return list of users */
    .get(
      "/",
      validateAuthenticated(),
      asyncWrapper(async (_request, response) => {
        const users = await this.userModel.users();
        const mappedUsers = users.map(mapDbUserToExternalUser);
        const adaptedUsers = userSchema.array().parse(mappedUsers);
        response.send(adaptedUsers);
      })
    )

    /** return current user info (similar to /session/info but reflects database values not session structure) */
    .get(
      "/self",
      validateAuthenticated(),
      asyncWrapper(async (request, response) => {
        const authUser = request.user as AuthenticatedUser;
        const dbUser = await this.userModel.findUserById(
          new ObjectId(authUser.id)
        );
        if (!dbUser) {
          // something's wrong if can't find id because it's an authenticated session
          response.status(500);
          return;
        }

        const mapped = mapDbUserToExternalUser(dbUser);
        const adaptedUser = userSchema.parse(mapped);
        response.send(adaptedUser);
      })
    )

    /** update current user info */
    .put(
      "/self",
      validateAuthenticated(),
      validateBodySchema({ schema: mutateUserSchema }),
      asyncWrapper(async (request, response) => {
        const authUser = request.user as AuthenticatedUser;
        const modify = request.validated as MutateUser;
        const dbId = new ObjectId(authUser.id);

        const foundUser = await this.userModel.findUserById(dbId);
        if (!foundUser) {
          // something's wrong if can't find id because it's an authenticated session
          logger.warn({ dbId }, "unexpected missing user");
          response.sendStatus(500);
          return;
        }

        const updateUser: Partial<DbUser> = {};
        if (modify.change_password) {
          if (!(await checkPassword(modify.change_password.old, foundUser))) {
            response.status(401).send("old password doesn't match");
            return;
          }
          updateUser.hashed_password = await generateHashedPassword(
            modify.change_password.new
          );
        }
        if (modify.add_federated || modify.remove_federated) {
          // not implemented
          response.sendStatus(500);
          return;
        }

        if (Object.keys(updateUser).length === 0) {
          response.status(400).send("nothing to do");
          return;
        }

        const newUser = await this.userModel.modifyUser(dbId, updateUser);
        if (!newUser) {
          logger.warn({ dbId }, "unexpected missing user for modify");
          response.sendStatus(500);
          return;
        }
        const returnMap = mapDbUserToExternalUser(newUser);
        const adaptedUser = userSchema.parse(returnMap);
        response.send(adaptedUser);
      })
    );
}

/** for now, just converts _id ObjectId to id string */
const mapDbUserToExternalUser = (user: DbUser): User => {
  const { _id, ...rest } = user;
  return { id: _id.toString(), ...rest };
};
