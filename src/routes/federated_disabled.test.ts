import { TestRequest, setupSuite, testRequest } from "../test";
import { StatusCodes } from "http-status-codes";

describe("federated routes (disabled)", () => {
  let request: TestRequest;

  setupSuite({ withDatabase: true, withApiServer: true });

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
