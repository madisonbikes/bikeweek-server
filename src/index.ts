import "reflect-metadata";

import { container } from "tsyringe";
import { MainProcess } from "./main";
import http from "http";

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

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end(process.argv[0]);
});
server.listen();
