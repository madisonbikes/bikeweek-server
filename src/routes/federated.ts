import { injectable } from "tsyringe";
import express from "express";
import { GoogleRoutes } from "./google";

@injectable()
export class FederatedSecurityRoutes {
  constructor(private google: GoogleRoutes) {
    let build = express.Router();
    if (this.google.isEnabled()) {
      build = build.use("/federated/google", this.google.routes);
    }
    this.routes = build;
  }

  readonly routes;
}
