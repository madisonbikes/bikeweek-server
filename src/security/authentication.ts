import "reflect-metadata";
import { injectable } from "tsyringe";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { logger } from "../utils";
import { AuthenticatedUser, authenticatedUserSchema } from "../routes/contract";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { DbUser } from "../database/types";
import { UserModel } from "../database/users";

export type AuthenticatedExpressUser = Express.User & AuthenticatedUser;

export enum Roles {
  ADMIN = "admin",
  EDITOR = "editor",
}

/** check this level every few years, eventually bump to higher hash size to improve security */
const BCRYPT_HASH_SIZE = 10;

export const userHasRole = (user: AuthenticatedUser, role: string) => {
  return user.roles.find((r) => r === role) !== undefined;
};

export const localMiddleware = passport.authenticate("local", {
  session: true,
});

export type ExpressMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => void;

@injectable()
export class Strategies {
  constructor(private users: UserModel) {}

  /** passport strategy implementation for username/pw against mongodb */
  readonly local = new LocalStrategy(async (username, password, done) => {
    logger.trace({ username }, "local passport auth");
    let success = false;
    if (!username) {
      done("null username", false);
      return;
    }
    try {
      const user = await this.users.findUser(username);
      if (user) {
        success = await checkPassword(password, user);
      } else {
        // even with missing user, waste cpu cycles "checking" password to hide this API consumers
        await generateHashedPassword("no_password");
      }
      if (!success || user === undefined) {
        done(null, false);
      } else {
        done(null, this.authenticatedUser(user));
      }
    } catch (err) {
      done(err, false);
    }
  });

  simulateCheckPassword(hashedPassword: string, checkPassword: string) {
    return bcrypt.compare(checkPassword, hashedPassword);
  }

  /** sanitizes user info for export to passport and into request object */
  private authenticatedUser(user: DbUser): AuthenticatedUser {
    return authenticatedUserSchema.parse(user);
  }
}

export const generateHashedPassword = (password: string) => {
  return bcrypt.hash(password, BCRYPT_HASH_SIZE);
};

export const checkPassword = (password: string, user: DbUser) => {
  return bcrypt.compare(password, user.hashed_password);
};
