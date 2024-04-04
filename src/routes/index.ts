import express from "express";
import { injectable } from "tsyringe";
import { EventRoutes } from "./events";
import { UserRoutes } from "./users";
import { SessionRoutes } from "./session";
import info from "./info";

@injectable()
export class ApiRoutes {
  readonly routes;

  constructor(
    private userRoutes: UserRoutes,
    private sessionRoutes: SessionRoutes,
    private eventRoutes: EventRoutes,
  ) {
    this.routes = express
      .Router()
      .use("/info", info.routes())
      .use("/session", this.sessionRoutes.routes)
      .use("/users", this.userRoutes.routes)
      .use("/events", this.eventRoutes.routes);
  }
}
