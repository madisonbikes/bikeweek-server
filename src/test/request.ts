import supertest from "supertest";
import { runningApiServer, Server } from ".";
import TestAgent from "supertest/lib/agent";
export { Server } from "http";

/** helper type alias for supertest request object */
export type TestRequest = TestAgent;

/** helper function to build a supertest test request from a server object */
export const testRequest = (server?: Server) => {
  const s = server ?? runningApiServer;
  return supertest.agent(s);
};
