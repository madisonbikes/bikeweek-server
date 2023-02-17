import http, { Server } from "http";
import { injectable } from "tsyringe";
import express, { Request, Response } from "express";
import cors from "cors";
import passport from "passport";

import { Configuration } from "./config";
import { logger } from "./utils";
import { ApiRoutes } from "./routes";
import { AuthenticationStrategies } from "./security";
import { SessionMiddlewareConfigurator } from "./session";

@injectable()
export class ApiServer {
  constructor(
    private configuration: Configuration,
    private apiRoutes: ApiRoutes,
    private authenticationStrategies: AuthenticationStrategies,
    private sessionMiddlewareConfigurator: SessionMiddlewareConfigurator
  ) {}

  server: Server | undefined;

  create(): Promise<Server> {
    const app = express();

    // FIXME disable right now because of issues
    //app.use(helmet({ contentSecurityPolicy: false }));

    app.use(express.json());

    if (this.configuration.enableCors) {
      // cors should only be used for development -- production serves from same server/port
      app.use(cors());
    }

    if (this.configuration.reactStaticRootDir) {
      app.use("/", express.static(this.configuration.reactStaticRootDir));
    }

    // used for login method
    passport.use(this.authenticationStrategies.local);
    passport.serializeUser<string>((user, done) => {
      try {
        logger.trace(user, "serialize user");
        const data = JSON.stringify(user);
        done(null, data);
      } catch (err) {
        done(err, undefined);
      }
    });

    passport.deserializeUser<string>((data, done) => {
      try {
        const user = JSON.parse(data);
        logger.trace(user, "deserialize user");
        done(null, user);
      } catch (err) {
        done(err, undefined);
      }
    });

    app.use(this.sessionMiddlewareConfigurator.build());
    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/api/v1", this.apiRoutes.routes);

    app.use((err: Error, _req: Request, res: Response) => {
      logger.error(err, "Unhandled server error");
      res.sendStatus(500);
    });

    app.on("error", (err) => {
      logger.error(err);
    });

    this.server = http.createServer(app);
    return Promise.resolve(this.server);
  }

  async start(): Promise<void> {
    await this.create();
    this.server?.listen(this.configuration.serverPort, () => {
      logger.info(
        `Server listening on http://localhost:${this.configuration.serverPort}`
      );
    });
  }

  stop(): Promise<void> {
    this.server?.close();
    return Promise.resolve();
  }
}
