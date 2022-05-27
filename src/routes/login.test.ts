import {
  setupSuite,
  testContainer,
  testDatabase,
  testRequest,
  TestRequest,
} from "../test";
import { ApiServer } from "../server";

describe("login route", () => {
  let apiServer: ApiServer;
  let request: TestRequest;

  setupSuite({ withDatabase: true });

  beforeAll(async () => {
    apiServer = testContainer().resolve(ApiServer);
    request = testRequest(await apiServer.create());

    // create a test user for login
    testDatabase().users.deleteMany({});
    testDatabase().users.insertOne({
      username: "testuser",
      // this is a bcrypt of "password"
      password: "$2a$12$T6KY4dGCetX4j9ld.pz6aea8NCk3Ug4aCPfyH2Ng23LaGFB0vVmHW",
    });
  });

  afterAll(async () => {
    await apiServer.stop();
  });

  it("responds to login api with good credentials successfully", async () => {
    return request
      .post("/api/v1/login")
      .send({ username: "testuser", password: "password" })
      .expect(200)
      .expect((request) => {
        // assume this is a JWT
        expect(request.text.length).toBeGreaterThan(100);
      });
  });

  it("responds to login api without credentials as bad request", async () => {
    return request
      .post("/api/v1/login")
      .expect(400)
      .expect(/username is a required field/)
      .expect(/password is a required field/);
  });

  it("responds to login api with extra fields as bad request", async () => {
    return request
      .post("/api/v1/login")
      .send({ username: "user1", password: "password", extraxyz: "extra" })
      .expect(400)
      .expect(/unspecified keys/)
      .expect(/extraxyz/);
  });

  it("responds to login api with credentials as success request but unauthorized", async () => {
    return request
      .post("/api/v1/login")
      .send({ username: "bad", password: "bad" })
      .expect(401);
  });
});
