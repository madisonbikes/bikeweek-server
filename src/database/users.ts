import { injectable } from "tsyringe";
import { Database } from "./database";
import { DbFederatedProvider, DbUser, dbUserSchema } from "./types";

@injectable()
export class UserModel {
  constructor(private database: Database) {}

  findUser = async (username: string) => {
    const value = await this.database.users.findOne({
      username,
    });
    if (!value) {
      return undefined;
    }

    return dbUserSchema.parse(value);
  };

  findFederatedUser = async (provider: DbFederatedProvider, id: string) => {
    const value = await this.database.users
      .find({
        federated: { provider, id },
      })
      .toArray();
    if (value.length !== 1) {
      return undefined;
    }

    return dbUserSchema.parse(value[0]);
  };

  users = async () => {
    return dbUserSchema
      .array()
      .parse(await this.database.users.find({}).toArray());
  };

  addUser = async (user: DbUser) => {
    await this.database.users.insertOne(user);
    return user;
  };
}
