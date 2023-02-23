import { TestRequest } from "./request";

export const loginTestUser = (request: TestRequest, password = "password") => {
  return request
    .post("/api/v1/session/login")
    .send({ username: "testuser", password })
    .expect(200);
};

export const loginTestAdminUser = (
  request: TestRequest,
  password = "password"
) => {
  return request
    .post("/api/v1/session/login")
    .send({ username: "testadmin", password })
    .expect(200);
};
