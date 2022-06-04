import "reflect-metadata";
import { Configuration, JwtConfiguration } from "../config";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  container as rootContainer,
  DependencyContainer,
  injectable,
  Lifecycle,
} from "tsyringe";
import { Database } from "../database/database";
import assert from "assert";

let testMongoUri: string;
let testMongoServer: MongoMemoryServer | undefined;

// the test container is initialized once for the suite
let tc: DependencyContainer | undefined;

export type SuiteOptions = {
  // spin up a memory mongodb instance for testing purposes
  withDatabase: boolean;
};

/** entry point that should be included first in each describe block */
export function setupSuite(options: Partial<SuiteOptions> = {}): void {
  beforeAll(async () => {
    assert(tc === undefined);
    tc = await initializeSuite(options);

    await createDatabaseConnection();
  });

  afterAll(async () => {
    assert(tc);

    await clearDatabaseConnection();
    await cleanupSuite();
    tc = undefined;
  });
}

/**
 * Callers that make modifications to the container should do so in a CHILD container because the container is not reset
 * between test
 */
export function testContainer(): DependencyContainer {
  assert(tc);
  return tc;
}

/** return the custom test configuration object that exposes setters for testing */
export function testConfiguration(): TestConfiguration {
  return testContainer().resolve(Configuration) as TestConfiguration;
}

/** return the object managing the connection to the mongodb instance */
export function testDatabase(): Database {
  return testContainer().resolve(Database);
}

async function initializeSuite(
  options: Partial<SuiteOptions>
): Promise<DependencyContainer> {
  const withDatabase = options.withDatabase;
  if (withDatabase) {
    // start the mongo in-memory server on an ephemeral port
    testMongoServer = await MongoMemoryServer.create();
    testMongoUri = testMongoServer.getUri();
  }

  // don't use value registrations because they will be cleared in the beforeEach() handler
  const testContainer = rootContainer.createChildContainer();

  // provide a custom TestConfiguration adapted for the testing environment
  testContainer.register<Configuration>(
    Configuration,
    { useClass: TestConfiguration },
    { lifecycle: Lifecycle.ContainerScoped }
  );
  if (withDatabase) {
    // provide a Database object scoped to the container rather, overriding singleton normally
    testContainer.register<Database>(
      Database,
      { useClass: Database },
      { lifecycle: Lifecycle.ContainerScoped }
    );
  } else {
    // if database not enabled, trigger an error if we try to inject a database object
    testContainer.register<Database>(Database, {
      useFactory: () => {
        throw new Error("No database allowed for this test suite");
      },
    });
  }
  return testContainer;
}

async function cleanupSuite(): Promise<void> {
  await testMongoServer?.stop();
  testMongoServer = undefined;
}

@injectable()
export class TestConfiguration extends Configuration {
  declare mongoDbUri;
  declare jwt: JwtConfiguration;

  constructor() {
    super();
    this.mongoDbUri = testMongoUri;
  }
}

async function clearDatabaseConnection() {
  await testDatabase().stop();
}

async function createDatabaseConnection() {
  await testDatabase().start();
}
