import { setupSuite, testRequest, TestRequest, createTestUser } from "../test";
import { JwtPayload, verify } from "jsonwebtoken";
import { loginResponseSchema } from "./contract";

describe("login route", () => {
  let request: TestRequest;

  setupSuite({ withDatabase: true, withApiServer: true });

  beforeAll(async () => {
    // create a test user for login
    await createTestUser();
  });

  beforeEach(() => {
    request = testRequest();
  });

  it("responds to login api with good credentials successfully", () => {
    return request
      .post("/api/v1/login")
      .send({ username: "testuser", password: "password" })
      .expect(200)
      .expect((request) => {
        const response = loginResponseSchema.parse(request.body);
        // request returns a JWT
        const verified = verify(response.jwtToken, "secret", {
          audience: "audience",
          issuer: "issuer",
        }) as JwtPayload;

        expect(verified.sub).toEqual("testuser");

        // verify expire date is ~10min in future
        const currentDate = Date.now() / 1000;
        expect(verified.exp).toBeGreaterThan(currentDate + 9 * 60);
        expect(verified.exp).toBeLessThan(currentDate + 10 * 60);
      });
  });

  it("responds to login api without credentials as bad request", () => {
    return request
      .post("/api/v1/login")
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "invalid_type",
              path: ["username"],
            }),
            expect.objectContaining({
              code: "invalid_type",
              path: ["password"],
            }),
          ])
        );
      });
  });

  it("responds to login api with extra fields as bad request", () => {
    return request
      .post("/api/v1/login")
      .send({ username: "user1", password: "password", extraxyz: "extra" })
      .expect(400)
      .expect(/unrecognized_keys/)
      .expect(/extraxyz/);
  });

  it("responds to login api with credentials as success request but unauthorized", () => {
    return request
      .post("/api/v1/login")
      .send({ username: "bad", password: "bad" })
      .expect(401);
  });
});
