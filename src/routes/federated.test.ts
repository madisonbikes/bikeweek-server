import { TestRequest, loginTestUser, setupSuite, testRequest } from "../test";
import { createDuplicatedFederatedId, createTestUser } from "../test/data";
import { injectable, Lifecycle } from "tsyringe";
import { GoogleFederatedVerifier } from "../security/google";
import { StatusCodes } from "http-status-codes";
import { userSchema } from "./contract";

describe("federated routes", () => {
  describe("google enabled", () => {
    setupSuite({
      withDatabase: true,
      withApiServer: true,
      clearUsers: true,
      // enable the google endpoint
      withModifiedConfiguration: (config) => {
        config.googleAuthClientId = "blarg";
      },
      // use the mock verifier
      withTestContainerInit: (container) => {
        container.register(
          GoogleFederatedVerifier,
          {
            useClass: MockGoogleFederatedVerifier,
          },
          { lifecycle: Lifecycle.ContainerScoped },
        );
      },
    });

    let request: TestRequest;

    beforeEach(async () => {
      // create a test user for login
      await createTestUser();

      request = testRequest();
    });

    afterEach(() => {
      mockVerifierReturnEmail = "";
    });

    it("responds to federated/google auth with 401 if configured", async () => {
      await request
        .post("/api/v1/session/federated/login")
        .send({ provider: "google", token: "blarg" })
        .expect(StatusCodes.UNAUTHORIZED);
    });

    it("responds to federated/google auth with 400 if supply invalid body", async () => {
      await request
        .post("/api/v1/session/federated/login")
        .send({ provider: "google", invalid_token: "blarg" })
        .expect(StatusCodes.BAD_REQUEST)
        .expect(/invalid_type/)
        .expect(/token/);
    });

    it("responds to federated/google auth with 400 if supply invalid provider", async () => {
      await request
        .post("/api/v1/session/federated/login")
        .send({ provider: "bad_provider", token: "blarg" })
        .expect(StatusCodes.BAD_REQUEST)
        .expect(/invalid_union_discriminator/)
        .expect(/google/)
        .expect(/provider/);
    });

    it("responds to federated/google auth with proper match id", async () => {
      mockVerifierReturnEmail = "blarg@blarg.com";
      await request
        .post("/api/v1/session/federated/login")
        .send({ provider: "google", token: "blarg" })
        .expect(StatusCodes.OK);
    });

    it("responds to federated/google auth without proper match id", async () => {
      mockVerifierReturnEmail = "nomatch@blarg.com";
      await request
        .post("/api/v1/session/federated/login")
        .send({ provider: "google", token: "blarg" })
        .expect(StatusCodes.UNAUTHORIZED);
    });

    it("responds to federated/google auth with duplicate matching federated ids", async () => {
      await createDuplicatedFederatedId();
      mockVerifierReturnEmail = "blarg@blarg.com";
      await request
        .post("/api/v1/session/federated/login")
        .send({ provider: "google", token: "blarg" })
        .expect(StatusCodes.UNAUTHORIZED);
    });

    it("responds to authenticated self remove federated identity", async () => {
      await loginTestUser(request);

      const userResponse = await request
        .delete("/api/v1/users/self/federated/google")
        .expect(StatusCodes.OK);

      const parsed = userSchema.strict().parse(userResponse.body);
      expect(parsed).toMatchObject({
        username: "testuser",
        federated: [],
      });
      expect(parsed.id).toBeDefined();
    });

    it("responds to authenticated self add federated identity", async () => {
      await loginTestUser(request);

      mockVerifierReturnEmail = "nomatch@blarg.com";

      const userResponse = await request
        .put("/api/v1/users/self/federated")
        .send({ provider: "google", validateToken: "any_token" })
        .expect(StatusCodes.OK);

      const parsed = userSchema.strict().parse(userResponse.body);
      expect(parsed).toMatchObject({
        username: "testuser",
        federated: [{ provider: "google", federatedId: "nomatch@blarg.com" }],
      });
      expect(parsed.id).toBeDefined();
    });
  });

  describe("google disabled", () => {
    let request: TestRequest;

    setupSuite({ withDatabase: true, withApiServer: true, clearUsers: true });

    beforeAll(async () => {
      // create a test user for login
      await createTestUser();
    });

    beforeEach(() => {
      request = testRequest();
    });

    it("responds to federated/google auth with 404 if not configured", async () => {
      await request
        .post("/api/v1/session/federated/login")
        .send({ provider: "google", token: "blarg" })
        .expect(StatusCodes.NOT_FOUND);
    });
  });
});

let mockVerifierReturnEmail = "";

@injectable()
class MockGoogleFederatedVerifier extends GoogleFederatedVerifier {
  override verifyFederatedToken() {
    return Promise.resolve(mockVerifierReturnEmail);
  }

  override get enabled(): boolean {
    return true;
  }
}
