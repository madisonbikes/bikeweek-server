import http, { Server } from "http";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import passport from "passport";

import { configuration } from "./config";
import { logger } from "./utils";
import routes from "./routes";
import { authenticationStrategies } from "./security";
import { sessionMiddlewareConfigurator } from "./session";
import { StatusCodes } from "http-status-codes";

export class ApiServer {
  server: Server | undefined;

  create(): Promise<Server> {
    const app = express();

    // FIXME disable right now because of issues
    //app.use(helmet({ contentSecurityPolicy: false }));

    app.use(express.json());

    if (configuration.enableCors) {
      // cors should only be used for development -- production serves from same server/port
      app.use(cors());
    }

    if (configuration.reactStaticRootDir) {
      app.use("/", express.static(configuration.reactStaticRootDir));
    }

    authenticationStrategies.registerPassportStrategies();
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
        const user = JSON.parse(data) as Express.User;
        logger.trace(user, "deserialize user");
        done(null, user);
      } catch (err) {
        done(err, undefined);
      }
    });

    app.use(sessionMiddlewareConfigurator.build());
    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/api/v1", routes.routes());

    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      logger.error(err, "Unhandled server error");
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    app.on("error", (err) => {
      logger.error(err);
    });

    this.server = http.createServer(app);
    return Promise.resolve(this.server);
  }

  async start(): Promise<void> {
    await this.create();
    this.server?.listen(configuration.serverPort, () => {
      logger.info(
        `Server listening on http://localhost:${configuration.serverPort}`,
      );
    });
  }

  stop(): Promise<void> {
    this.server?.close();
    return Promise.resolve();
  }
}
