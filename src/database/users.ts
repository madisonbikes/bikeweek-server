import { injectable } from "tsyringe";
import { Database } from "./database";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const UserSchema = z.object({
  username: z.string(),
  password: z.string(),
  admin: z.boolean().optional(),
});

export type User = z.infer<typeof UserSchema>;

@injectable()
export class UserModel {
  private readonly BCRYPT_HASH_SIZE = 10;

  constructor(private database: Database) {}

  findUser = async (username: string): Promise<User | undefined> => {
    const value = await this.database.users.findOne({
      username: username,
    });
    if (value == null) {
      return undefined;
    }

    return UserSchema.parse(value);
  };

  users = (): Promise<User[]> => {
    return UserSchema.array().parseAsync(
      this.database.users.find({}).toArray()
    );
  };

  addUser = async (user: User): Promise<User> => {
    const newUser: User = { ...user };
    newUser.password = await bcrypt.hash(user.password, this.BCRYPT_HASH_SIZE);
    await this.database.users.insertOne(newUser);
    return newUser;
  };

  checkPassword = (password: string, user: User): Promise<boolean> => {
    return bcrypt.compare(password, user.password);
  };
}
