import { injectable } from "tsyringe";
import { Database } from "./database";
import bcrypt from "bcryptjs";
import { DbUser, dbUserSchema } from "./types";

@injectable()
export class UserModel {
  private readonly BCRYPT_HASH_SIZE = 10;

  constructor(private database: Database) {}

  findUser = async (username: string): Promise<DbUser | undefined> => {
    const value = await this.database.users.findOne({
      username: username,
    });
    if (value == null) {
      return undefined;
    }

    return dbUserSchema.parse(value);
  };

  users = (): Promise<DbUser[]> => {
    return dbUserSchema
      .array()
      .parseAsync(this.database.users.find({}).toArray());
  };

  addUser = async (user: DbUser): Promise<DbUser> => {
    const newUser: DbUser = { ...user };
    newUser.password = await bcrypt.hash(user.password, this.BCRYPT_HASH_SIZE);
    await this.database.users.insertOne(newUser);
    return newUser;
  };

  checkPassword = (password: string, user: DbUser): Promise<boolean> => {
    return bcrypt.compare(password, user.password);
  };
}
