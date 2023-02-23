import { injectable } from "tsyringe";
import { Database } from "./database";
import { DbUser, dbUserSchema } from "./types";
import { logger } from "../utils";
import { FederatedProvider, MutateUser } from "../routes/contract";
import { ObjectId } from "mongodb";

@injectable()
export class UserModel {
  constructor(private database: Database) {}

  findUserByUsername = async (username: string) => {
    const value = await this.database.users.findOne({
      username,
    });
    if (!value) {
      return undefined;
    }
    return dbUserSchema.parse(value);
  };

  findUserById = async (_id: ObjectId) => {
    const value = await this.database.users.findOne({ _id });
    if (!value) {
      return undefined;
    }

    return dbUserSchema.parse(value);
  };

  findFederatedUser = async (
    provider: FederatedProvider,
    federatedId: string
  ) => {
    const value = await this.database.users
      .find({
        federated: { provider, federatedId },
      })
      .toArray();
    if (value.length === 0) {
      logger.debug({ provider, federatedId }, "no federated user found");
      return undefined;
    }
    if (value.length > 1) {
      logger.warn({ provider, federatedId }, "multiple federated users found");
      return undefined;
    }

    return dbUserSchema.parse(value[0]);
  };

  users = async () => {
    return dbUserSchema
      .array()
      .parse(await this.database.users.find({}).toArray());
  };

  modifyUser = async (_id: ObjectId, user: Partial<Omit<DbUser, "_id">>) => {
    const value = await this.database.users.updateOne({ _id }, { $set: user });
    if (value.modifiedCount !== 1) {
      return Promise.resolve(undefined);
    }
    return this.findUserById(_id);
  };

  /*
  addUser = async (user: DbUser) => {
    await this.database.users.insertOne(user);
    return user;
  };
  */
}
