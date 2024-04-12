import { OAuth2Client } from "google-auth-library";
import { configuration } from "../config";
import { FederatedProvider } from "../routes/contract";

const verifier = {
  name: (): FederatedProvider => "google",
  enabled: () => Boolean(configuration.googleAuthClientId),
  verifyFederatedToken: async (token: string): Promise<string | undefined> => {
    const client = new OAuth2Client({
      clientId: configuration.googleAuthClientId,
    });
    const verified = await client.verifyIdToken({ idToken: token });
    return verified.getPayload()?.email;
  },
};
export default verifier;
