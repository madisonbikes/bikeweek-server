import express from "express";
import { injectable } from "tsyringe";
import { LoginRoutes } from "./login";
import { UserRoutes } from "./users";

@injectable()
export class ApiRoutes {
  constructor(
    private userRoutes: UserRoutes,
    private loginRoutes: LoginRoutes
  ) {}

  routes = express
    .Router()
    .use(this.loginRoutes.routes)
    .use("/users", this.userRoutes.routes);
}
