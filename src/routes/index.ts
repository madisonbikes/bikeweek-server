import express from "express";
import { injectable } from "tsyringe";
import { EventRoutes } from "./events";
import { UserRoutes } from "./users";
import { SessionRoutes } from "./session";

@injectable()
export class ApiRoutes {
  constructor(
    private userRoutes: UserRoutes,
    private sessionRoutes: SessionRoutes,
    private eventRoutes: EventRoutes
  ) {}

  readonly routes = express
    .Router()
    .use("/session", this.sessionRoutes.routes)
    .use("/users", this.userRoutes.routes)
    .use("/events", this.eventRoutes.routes);
}
