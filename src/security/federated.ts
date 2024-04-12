import { Request } from "express";
import { buildAuthenticatedUser } from "../security";
import { userModel } from "../database/users";
import { logger } from "../utils";
import { Strategy } from "passport";
import googleFederatedVerifier from "./google";
import { FederatedLoginBody } from "../routes/contract";

export const STRATEGY_NAME = "federated";

class FederatedStrategy extends Strategy {
  constructor() {
    super();
    this.name = STRATEGY_NAME;
  }

  get enabled() {
    return googleFederatedVerifier.enabled();
  }

  override async authenticate(req: Request) {
    try {
      const auth = req.validated as FederatedLoginBody;
      if (auth.provider !== "google") {
        this.fail("unsupported federated authentication provider");
        return;
      }

      const email = await googleFederatedVerifier.verifyFederatedToken(
        auth.token,
      );

      let ok = false;
      if (email !== undefined) {
        const user = await userModel.findFederatedUser(
          googleFederatedVerifier.name(),
          email,
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
export const federatedStrategy = new FederatedStrategy();
