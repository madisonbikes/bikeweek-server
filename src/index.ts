import "reflect-metadata";

import { container } from "tsyringe";
import { MainProcess } from "./main";

/** expose command-line launcher */
if (require.main === module) {
  process.on("uncaughtException", (err) => {
    console.error(err);
    process.exit(1);
  });

  /** launches server. this syntax allows server startup to run as async function */
  Promise.resolve()
    .then(() => {
      const server = container.resolve(MainProcess);
      return server.start();
    })
    .catch((error) => {
      console.error(error);
    });
}

