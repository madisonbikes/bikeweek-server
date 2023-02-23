import { StatusCodes } from "http-status-codes";
import { loginTestUser, setupSuite, testRequest, TestRequest } from "../test";
import { createTestUser } from "../test/data";
import { userSchema } from "./contract";

describe("users routes", () => {
  setupSuite({
    withDatabase: true,
    withApiServer: true,
    clearUsers: true,
  });

  let request: TestRequest;

  beforeEach(async () => {
    // create a test user for login
    await createTestUser();

    request = testRequest();
  });

  it("responds to unauthenticated self info retrieval with 401", async () => {
    await request.get("/api/v1/users/self").expect(StatusCodes.UNAUTHORIZED);
  });

  it("responds to authenticated self info retrieval", async () => {
    await loginTestUser(request);

    const userResponse = await request
      .get("/api/v1/users/self")
      .expect(StatusCodes.OK);
    const parsed = userSchema.strict().parse(userResponse.body);
    expect(parsed).toMatchObject({
      username: "testuser",
      federated: [{ provider: "google", federatedId: "blarg@blarg.com" }],
    });
    expect(parsed.id).toBeDefined();
  });

  it("responds to authenticated self password change", async () => {
    await loginTestUser(request);

    const userResponse = await request
      .put("/api/v1/users/self")
      .send({ change_password: { old: "password", new: "new_password" } })
      .expect(StatusCodes.OK);
    const parsed = userSchema.strict().parse(userResponse.body);
    expect(parsed).toMatchObject({
      username: "testuser",
      federated: [{ provider: "google", federatedId: "blarg@blarg.com" }],
    });
    expect(parsed.id).toBeDefined();

    await loginTestUser(request, "new_password");
  });

  it("responds to authenticated self password change (bad old password)", async () => {
    await loginTestUser(request);

    await request
      .put("/api/v1/users/self")
      .send({ change_password: { old: "wrong_password", new: "new_password" } })
      .expect(StatusCodes.FORBIDDEN)
      .expect(/old password/);
  });

  it("responds to authenticated self change with bad change data (strict test)", async () => {
    await loginTestUser(request);

    await request
      .put("/api/v1/users/self")
      .send({ data: "bad" })
      .expect(StatusCodes.BAD_REQUEST);
  });

  it("responds to authenticated self change with empty change data (strict test)", async () => {
    await loginTestUser(request);

    await request
      .put("/api/v1/users/self")
      .send({})
      .expect(StatusCodes.NOT_ACCEPTABLE);
  });
});
