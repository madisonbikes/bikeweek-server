import { injectable } from "tsyringe";
import { Request } from "express";
import { Strategy } from "passport";
import { OAuth2Client } from "google-auth-library";
import { Configuration } from "../config";
import { FederatedGoogleAuthBody } from "../routes/contract";
import { UserModel } from "../database/users";
import { buildAuthenticatedUser } from "./authentication";
import { logger } from "../utils";

/** separate out this logic to make it easy to mock using tsyringe */
@injectable()
export class GoogleVerifier {
  constructor(private config: Configuration) {}

  async verifyToken(token: string) {
    const client = new OAuth2Client({
      clientId: this.config.googleAuthClientId,
    });
    const verified = await client.verifyIdToken({ idToken: token });
    return verified.getPayload()?.email;
  }
}

const STRATEGY_NAME = "google";

@injectable()
export class GoogleStrategy extends Strategy {
  constructor(
    private config: Configuration,
    private users: UserModel,
    private verifier: GoogleVerifier
  ) {
    super();
    this.name = STRATEGY_NAME;
  }

  isEnabled() {
    return Boolean(this.config.googleAuthClientId);
  }

  override async authenticate(req: Request) {
    try {
      const auth = req.validated as FederatedGoogleAuthBody;
      const email = await this.verifier.verifyToken(auth.token);

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
