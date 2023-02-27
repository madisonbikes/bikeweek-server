import { injectable } from "tsyringe";
import { OAuth2Client } from "google-auth-library";
import { Configuration } from "../config";
import { FederatedProvider } from "../routes/contract";

/** separate out this logic to make it easy to mock using tsyringe */
@injectable()
export class GoogleFederatedVerifier {
  constructor(private config: Configuration) {}

  get name(): FederatedProvider {
    return "google";
  }

  get enabled() {
    return Boolean(this.config.googleAuthClientId);
  }

  async verifyFederatedToken(token: string): Promise<string | undefined> {
    const client = new OAuth2Client({
      clientId: this.config.googleAuthClientId,
    });
    const verified = await client.verifyIdToken({ idToken: token });
    return verified.getPayload()?.email;
  }
}
