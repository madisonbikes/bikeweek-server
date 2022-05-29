import { injectable } from "tsyringe";
import { Database } from "./database";
import bcrypt from "bcryptjs";

export type User = {
  username: string;
  password: string;
  admin?: boolean;
};

@injectable()
export class UserModel {
  private readonly BCRYPT_HASH_SIZE = 10;

  constructor(private database: Database) {}

  findUser = async (username: string): Promise<User | undefined> => {
    return (await this.database.users.findOne({
      username: username,
    })) as unknown as User | undefined;
  };

  users = async (): Promise<User[]> => {
    return (await this.database.users.find({}).toArray()) as unknown as User[];
  };

  addUser = async (user: User): Promise<User | undefined> => {
    const newUser: User = { ...user };
    newUser.password = await bcrypt.hash(user.password, this.BCRYPT_HASH_SIZE);
    await this.database.users.insertOne(newUser);
    return newUser;
  };

  checkPassword = async (password: string, user: User): Promise<boolean> => {
    return bcrypt.compare(password, user.password);
  };
}
