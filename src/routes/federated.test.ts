import { setupSuite, testRequest, TestRequest } from "../test";
import { createDuplicatedFederatedId, createTestUser } from "../test/data";
import { injectable, Lifecycle } from "tsyringe";
import { GoogleVerifier } from "../security/google";

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
          GoogleVerifier,
          {
            useClass: MockGoogleVerifier,
          },
          { lifecycle: Lifecycle.ContainerScoped }
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
        .post("/api/v1/session/federated/google/login")
        .send({ token: "blarg" })
        .expect(401);
    });

    it("responds to federated/google auth with 400 if supply invalid body", async () => {
      await request
        .post("/api/v1/session/federated/google/login")
        .send({ invalid_token: "blarg" })
        .expect(400)
        .expect(/invalid_type/)
        .expect(/token/);
    });

    it("responds to federated/google auth with proper match id", async () => {
      mockVerifierReturnEmail = "blarg@blarg.com";
      await request
        .post("/api/v1/session/federated/google/login")
        .send({ token: "blarg" })
        .expect(200);
    });

    it("responds to federated/google auth without proper match id", async () => {
      mockVerifierReturnEmail = "nomatch@blarg.com";
      await request
        .post("/api/v1/session/federated/google/login")
        .send({ token: "blarg" })
        .expect(401);
    });

    it("responds to federated/google auth with duplicate matching federated ids", async () => {
      await createDuplicatedFederatedId();
      mockVerifierReturnEmail = "blarg@blarg.com";
      await request
        .post("/api/v1/session/federated/google/login")
        .send({ token: "blarg" })
        .expect(401);
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
        .post("/api/v1/session/federated/google/login")
        .send({ token: "blarg" })
        .expect(404);
    });
  });
});

let mockVerifierReturnEmail = "";

@injectable()
class MockGoogleVerifier extends GoogleVerifier {
  override verifyToken() {
    return Promise.resolve(mockVerifierReturnEmail);
  }
}
