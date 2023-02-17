import supertest from "supertest";
import { runningApiServer, Server } from ".";
export { Server } from "http";

/** helper type alias for supertest request object */
export type TestRequest = supertest.SuperTest<supertest.Test>;

/** helper function to build a supertest test request from a server object */
export const testRequest = (server?: Server): TestRequest => {
  const s = server ?? runningApiServer;
  return supertest.agent(s);
};