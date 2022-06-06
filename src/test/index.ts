import "reflect-metadata";
import supertest from "supertest";
import { Server } from "http";

export * from "./assertions";
export * from "./setup";

/** helper type alias for supertest request object */
export type TestRequest = supertest.SuperTest<supertest.Test>;

/** helper function to build a supertest test request from a server object */
export const testRequest = (server: Server): TestRequest => {
  return supertest(server);
};
