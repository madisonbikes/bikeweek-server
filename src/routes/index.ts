import express from "express";
import { injectable } from "tsyringe";
import { InfoRoutes } from "./info";
import { LoginRoutes } from "./login";
import { UserRoutes } from "./users";

@injectable()
export class ApiRoutes {
  constructor(
    private userRoutes: UserRoutes,
    private loginRoutes: LoginRoutes,
    private infoRoutes: InfoRoutes
  ) {}

  readonly routes = express
    .Router()
    .use(this.loginRoutes.routes)
    .use(this.infoRoutes.routes)
    .use("/users", this.userRoutes.routes);
}
