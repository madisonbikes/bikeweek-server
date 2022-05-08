import { injectable } from "tsyringe";
import { Configuration } from "./config";
import express from "express";
import passport from "passport";
import { ApiRoutes } from "./routes";
import { AuthenticationHelper } from "./security/authentication";

@injectable()
export class ApiServer {
  constructor(
    private configuration: Configuration,
    private apiRoutes: ApiRoutes,
    private authenticationHelper: AuthenticationHelper
  ) {}

  async start(): Promise<void> {
    const app = express();

    app.use(express.json());

    // used for login method
    passport.use(this.authenticationHelper.localStrategy);

    // used for sec
    passport.use(this.authenticationHelper.jwtStrategy);

    app.use(passport.initialize());

    app.use("/api/v1", this.apiRoutes.routes);

    app.listen(this.configuration.apiPort, () => {
      console.log(
        `Server listening on http://localhost:${this.configuration.apiPort}`
      );
    });
  }
}
