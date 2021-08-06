import "reflect-metadata";

import { container } from "tsyringe";
import { MainProcess } from "./main";

function main() {
  const server = container.resolve(MainProcess);
  return server.start();
}

/** launches server. this syntax allows server startup to run as async function */
Promise.resolve()
  .then(() => main())
  .catch((error) => {
    console.error(error);
    throw error;
  });
