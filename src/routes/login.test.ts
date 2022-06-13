import {
  setupSuite,
  testConfiguration,
  testContainer,
  testDatabase,
  testRequest,
  TestRequest,
} from "../test";
import { ApiServer } from "../server";
import { JwtPayload, verify } from "jsonwebtoken";

describe("login route", () => {
  let apiServer: ApiServer;
  let request: TestRequest;

  setupSuite({ withDatabase: true });

  beforeAll(async () => {
    apiServer = testContainer().resolve(ApiServer);
    request = testRequest(await apiServer.create());

    const config = testConfiguration();
    config.jwt = {
      // preserve defaults
      ...config.jwt,

      // override
      secret: "secret",
      audience: "audience",
      issuer: "issuer",
      expiresIn: "10m",
    };

    // create a test user for login
    const db = testDatabase();
    await db.users.deleteMany({});
    await db.users.insertOne({
      username: "testuser",
      // this is a bcrypt of "password"
      password: "$2a$12$T6KY4dGCetX4j9ld.pz6aea8NCk3Ug4aCPfyH2Ng23LaGFB0vVmHW",
    });
  });

  afterAll(async () => {
    await apiServer.stop();
  });

  it("responds to login api with good credentials successfully", () => {
    return request
      .post("/api/v1/login")
      .send({ username: "testuser", password: "password" })
      .expect(200)
      .expect((request) => {
        // request returns a JWT
        const verified = verify(request.text, "secret", {
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
      .expect(/username is a required field/)
      .expect(/password is a required field/);
  });

  it("responds to login api with extra fields as bad request", () => {
    return request
      .post("/api/v1/login")
      .send({ username: "user1", password: "password", extraxyz: "extra" })
      .expect(400)
      .expect(/unspecified keys/)
      .expect(/extraxyz/);
  });

  it("responds to login api with credentials as success request but unauthorized", () => {
    return request
      .post("/api/v1/login")
      .send({ username: "bad", password: "bad" })
      .expect(401);
  });
});
