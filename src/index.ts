import "reflect-metadata";

import { container } from "tsyringe";
import { MainProcess } from "./main";

/** launches server. this syntax allows server startup to run as async function */
Promise.resolve()
  .then(() => {
    const server = container.resolve(MainProcess);
    if (process.argv.find((v) => v == "--once")) {
      server.configuration.executeOnce = true;
    }
    if(process.argv.find((v) => v == "--dryrun")) {
      server.configuration.dryRun = true;
    }
    return server.start();
  })
  .catch((error) => {
    console.error(error);
    throw error
  });