import { start } from "./main";

/** launches server. this syntax allows server startup to run as async function */
Promise.resolve()
  .then(() => start())
  .catch((error) => {
    console.error(error);
    throw error;
  });
