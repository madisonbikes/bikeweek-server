import { injectable } from "tsyringe";
import { Configuration } from "./config";
import express from "express";
import passport from "passport";
import { ApiRoutes } from "./routes";

@injectable()
export class ApiServer {
  constructor(
    private configuration: Configuration,
    private routes: ApiRoutes
  ) {}

  async start(): Promise<void> {
    const app = express();

    app.use(express.json());

    app.use(passport.initialize());

    app.use("/api/v1", this.routes.routes);

    app.listen(this.configuration.apiPort, () => {
      console.log(
        `Server listening on http://localhost:${this.configuration.apiPort}`
      );
    });
  }
}
