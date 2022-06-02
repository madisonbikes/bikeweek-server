import { injectable } from "tsyringe";
import { Strategy as JwtStrategy } from "passport-jwt";
import { User, UserModel } from "../database/users";
import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import { JwtManager, JwtPayload } from "./jwt";

export type AuthenticatedUser = Express.User & {
  username: string;
  admin: boolean;
};

export const localMiddleware = passport.authenticate("local", {
  session: false,
});

/** passport jwt middleware */
export const jwtMiddleware = passport.authenticate("jwt", { session: false });

@injectable()
export class Strategies {
  constructor(private userModel: UserModel, private jwtManager: JwtManager) {}

  /** passport strategy implementation for JWT bearer auth tokens */
  readonly jwt = new JwtStrategy(
    this.jwtManager.strategyOptions(),
    async (payload: JwtPayload, done) => {
      console.log(`payload ${JSON.stringify(payload)}`);
      const lookupUser = await this.userModel.findUser(payload?.sub ?? "");
      if (lookupUser) {
        done(null, this.authenticatedUser(lookupUser));
      } else {
        // user deleted?
        done(null, false);
      }
    }
  );

  /** passport strategy implmentation for username/pw against mongodb */
  readonly local = new LocalStrategy(async (username, password, done) => {
    let success = false;
    if (!username) {
      done("null username", false);
      return;
    }

    const user = await this.userModel.findUser(username);
    if (user) {
      success = await this.userModel.checkPassword(password, user);
    }
    if (!success || !user) {
      done(null, false);
    } else {
      done(null, this.authenticatedUser(user));
    }
  });

  /** sanitizes user info for export to JWT and into request object */
  private authenticatedUser(user: User): AuthenticatedUser {
    return { username: user.username, admin: user.admin ?? false };
  }
}
