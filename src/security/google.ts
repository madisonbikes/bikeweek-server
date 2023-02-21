import { injectable } from "tsyringe";
import { Request } from "express";
import { Strategy } from "passport";
import { OAuth2Client } from "google-auth-library";
import { Configuration } from "../config";
import { FederatedGoogleAuthBody } from "../routes/contract";
import { UserModel } from "../database/users";
import { buildAuthenticatedUser } from "./authentication";
import { logger } from "../utils";

const STRATEGY_NAME = "google";

@injectable()
export class GoogleStrategy extends Strategy {
  constructor(private config: Configuration, private users: UserModel) {
    super();
    this.name = STRATEGY_NAME;
  }

  isEnabled() {
    return this.config.googleAuthClientId;
  }

  override async authenticate(req: Request) {
    const client = new OAuth2Client({
      clientId: this.config.googleAuthClientId,
    });
    try {
      const auth = req.validated as FederatedGoogleAuthBody;
      const verified = await client.verifyIdToken({ idToken: auth.token });
      const email = verified.getPayload()?.email;

      let ok = false;
      if (email !== undefined) {
        const user = await this.users.findFederatedUser("google", email);
        if (user !== undefined) {
          ok = true;
          this.success(buildAuthenticatedUser(user));
        }
      }
      if (!ok) {
        this.fail("user not found");
      }
    } catch (err) {
      logger.warn(err, "google authenticate");
      this.fail("error");
    }
  }
}
