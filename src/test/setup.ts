import { testConfiguration } from "../config";
import { MongoMemoryServer } from "mongodb-memory-server";
import { database } from "../database/database";
import apiServer from "../server";
import { Server } from "./request";

export let runningApiServer: Server | undefined;

export type SuiteOptions = {
  // spin up a memory mongodb instance for testing purposes
  withDatabase: boolean;

  // run api server
  withApiServer: boolean;

  // clear users after each test
  clearUsers: boolean;
};

/** entry point that should be included first in each describe block */
export const setupSuite = (options: Partial<SuiteOptions> = {}): void => {
  const withDatabase = options.withDatabase ?? false;
  const withApiServer = options.withApiServer ?? false;

  let mongoServer: MongoMemoryServer | undefined;

  beforeAll(async () => {
    testConfiguration.reset();
    testConfiguration.add({
      redisUri: "",
      secureCookie: false,
      gravityFormsUri: "",
      schedUri: "",
      googleAuthClientId: "",
    });
    if (withDatabase) {
      // start the mongo in-memory server on an ephemeral port
      mongoServer = await MongoMemoryServer.create();
      const mongoDbUri = mongoServer.getUri();

      // set the custom mongodb uri
      testConfiguration.add({ mongoDbUri });

      await database.start();
    }

    if (withApiServer) {
      runningApiServer = await apiServer.create();
    }
  });

  afterEach(async () => {
    const queries: Array<Promise<unknown>> = [];
    if (options.clearUsers ?? false) {
      queries.push(database.users.deleteMany({}));
    }
    await Promise.all(queries);
  });

  afterAll(async () => {
    if (withApiServer) {
      await apiServer.stop();
      runningApiServer = undefined;
    }

    if (withDatabase) {
      await mongoServer?.stop();
      mongoServer = undefined;

      await database.stop();
    }

    await cleanupSuite();
  });
};

export const initializeSuite = () => {
  // empty, exists for symmetry with cleanupSuite
};

export const cleanupSuite = async (): Promise<void> => {
  // empty, exists for symmetry with initializeSuite
};
