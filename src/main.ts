import { database } from "./database/database";
import { ApiServer } from "./server";
import { poller } from "./gravityforms/poller";
import { eventSync } from "./sched/sync";
import { redis } from "./redis";

// unify all services into one start function
export async function start() {
  const apiServer = new ApiServer();

  await database.start();
  await redis.start();
  await apiServer.start();
  await poller.start();
  await eventSync.start();
}
