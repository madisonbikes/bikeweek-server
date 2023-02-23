import { injectable } from "tsyringe";

import bcrypt from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import { logger } from "../utils";
import { UserModel } from "../database/users";
import { DbUser } from "../database/types";
import { buildAuthenticatedUser } from "./authentication";

/** check this level every few years, eventually bump to higher hash size to improve security */
const BCRYPT_HASH_SIZE = 10;

@injectable()
export class LocalStrategyProvider {
  constructor(private users: UserModel) {}

  /** passport strategy implementation for username/pw against mongodb */
  readonly strategy = new LocalStrategy(async (username, password, done) => {
    logger.trace({ username }, "local passport auth");
    let success = false;
    if (!username) {
      done("null username", false);
      return;
    }
    try {
      const user = await this.users.findUserByUsername(username);
      if (user) {
        success = await checkPassword(password, user);
      } else {
        // even with missing user, waste cpu cycles "checking" password to hide this API consumers
        await generateHashedPassword("no_password");
      }
      if (!success || user === undefined) {
        done(null, false);
      } else {
        done(null, buildAuthenticatedUser(user));
      }
    } catch (err) {
      done(err, false);
    }
  });
}

export const generateHashedPassword = (password: string) => {
  return bcrypt.hash(password, BCRYPT_HASH_SIZE);
};

export const checkPassword = (password: string, user: DbUser) => {
  return bcrypt.compare(password, user.hashed_password);
};
