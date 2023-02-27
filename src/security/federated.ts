import { injectable } from "tsyringe";
import { Request } from "express";
import { buildAuthenticatedUser } from "../security";
import { UserModel } from "../database/users";
import { logger } from "../utils";
import { Strategy } from "passport";
import { GoogleFederatedVerifier } from "./google";
import { FederatedLoginBody } from "../routes/contract";

export const STRATEGY_NAME = "federated";

@injectable()
export class FederatedStrategy extends Strategy {
  constructor(
    private users: UserModel,
    private googleVerifier: GoogleFederatedVerifier
  ) {
    super();
    this.name = STRATEGY_NAME;
  }

  get enabled() {
    return this.googleVerifier.enabled;
  }

  override async authenticate(req: Request) {
    try {
      const auth = req.validated as FederatedLoginBody;
      if (auth.provider !== "google") {
        this.fail("unsupported federated authentication provider");
        return;
      }

      const email = await this.googleVerifier.verifyFederatedToken(auth.token);

      let ok = false;
      if (email !== undefined) {
        const user = await this.users.findFederatedUser(
          this.googleVerifier.name,
          email
        );
        if (user !== undefined) {
          ok = true;
          this.success(buildAuthenticatedUser(user));
        }
      }
      if (!ok) {
        this.fail("user not found");
      }
    } catch (err) {
      logger.warn(err, "federated authenticate");
      this.fail("error");
    }
  }
}
