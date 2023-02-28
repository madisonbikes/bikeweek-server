import express from "express";
import { injectable } from "tsyringe";
import { UserModel } from "../database/users";
import {
  AddFederatedId,
  addFederatedIdSchema,
  AuthenticatedUser,
  ChangeUserPassword,
  changeUserPasswordSchema,
  federatedProviderSchema,
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
import { StatusCodes } from "http-status-codes";
import { GoogleFederatedVerifier } from "../security/google";

@injectable()
export class UserRoutes {
  constructor(
    private userModel: UserModel,
    private googleFederatedVerifier: GoogleFederatedVerifier
  ) {}

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
          response.status(StatusCodes.CONFLICT).send("user already exists");
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
          response.status(StatusCodes.INTERNAL_SERVER_ERROR);
          return;
        }

        const mapped = mapDbUserToExternalUser(dbUser);
        const adaptedUser = userSchema.parse(mapped);
        response.send(adaptedUser);
      })
    )

    /** update current user info */
    .put(
      "/self/password",
      validateAuthenticated(),
      validateBodySchema({ schema: changeUserPasswordSchema }),
      asyncWrapper(async (request, response) => {
        const authUser = request.user as AuthenticatedUser;
        const modify = request.validated as ChangeUserPassword;
        const dbId = new ObjectId(authUser.id);

        const foundUser = await this.userModel.findUserById(dbId);
        if (!foundUser) {
          // something's wrong if can't find id because it's an authenticated session
          logger.warn({ dbId }, "unexpected missing user");
          response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
          return;
        }

        if (!(await checkPassword(modify.old, foundUser))) {
          response
            .status(StatusCodes.FORBIDDEN)
            .send("old password doesn't match");
          return;
        }
        const hashed_password = await generateHashedPassword(modify.new);

        const newUser = await this.userModel.modifyUser(dbId, {
          hashed_password,
        });
        if (!newUser) {
          logger.warn({ dbId }, "unexpected missing user for modify");
          response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
          return;
        }
        const returnMap = mapDbUserToExternalUser(newUser);
        const adaptedUser = userSchema.parse(returnMap);
        response.send(adaptedUser);
      })
    )
    .put(
      "/self/federated",
      validateAuthenticated(),
      validateBodySchema({ schema: addFederatedIdSchema }),
      asyncWrapper(async (request, response) => {
        const authUser = request.user as AuthenticatedUser;
        const dbId = new ObjectId(authUser.id);
        const data = request.body as AddFederatedId;
        const federatedId =
          await this.googleFederatedVerifier.verifyFederatedToken(
            data.validateToken
          );
        if (federatedId === undefined) {
          response.sendStatus(StatusCodes.FORBIDDEN);
          return;
        }
        const result = await this.userModel.connectFederatedProvider(dbId, {
          provider: data.provider,
          federatedId,
        });
        if (!result) {
          response.sendStatus(StatusCodes.NOT_FOUND);
        } else {
          const returnMap = mapDbUserToExternalUser(result);
          const adaptedUser = userSchema.parse(returnMap);
          response.send(adaptedUser);
        }
      })
    )
    .delete(
      "/self/federated/:provider",
      validateAuthenticated(),
      asyncWrapper(async (request, response) => {
        const authUser = request.user as AuthenticatedUser;
        const dbId = new ObjectId(authUser.id);
        const provider = federatedProviderSchema.parse(request.params.provider);
        const result = await this.userModel.disconnectFederatedProvider(
          dbId,
          provider
        );
        if (!result) {
          response.sendStatus(StatusCodes.NOT_FOUND);
        } else {
          const returnMap = mapDbUserToExternalUser(result);
          const adaptedUser = userSchema.parse(returnMap);
          response.send(adaptedUser);
        }
      })
    );
}

/** for now, just converts _id ObjectId to id string */
const mapDbUserToExternalUser = (user: DbUser): User => {
  const { _id, ...rest } = user;
  return { id: _id.toString(), ...rest };
};
