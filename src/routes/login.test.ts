import { setupSuite, testContainer, testRequest, TestRequest } from "../test";
import { ApiServer } from "../server";

describe("login route", () => {
  let apiServer: ApiServer;
  let request: TestRequest;

  setupSuite({ withDatabase: true });

  beforeAll(async () => {
    apiServer = testContainer().resolve(ApiServer);
    request = testRequest(await apiServer.create());
  });

  afterAll(async () => {
    await apiServer.stop();
  });

  it("responds to login api without credentials as bad request", async () => {
    return request.post("/api/v1/login").expect(400);
  });

  it("responds to login api with credentials as success request but unauthorized", async () => {
    return request
      .post("/api/v1/login")
      .send({ username: "bad", password: "bad" })
      .expect(401);
  });
});
