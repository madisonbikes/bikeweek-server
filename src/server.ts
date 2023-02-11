import { injectable } from "tsyringe";
import { Configuration } from "./config";
import express, { Request, Response } from "express";
import passport from "passport";
import { ApiRoutes } from "./routes";
import { Strategies } from "./security/authentication";
import cors from "cors";
import http, { Server } from "http";
import { logger } from "./utils";

@injectable()
export class ApiServer {
  constructor(
    private configuration: Configuration,
    private apiRoutes: ApiRoutes,
    private strategies: Strategies
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
    passport.use(this.strategies.local);

    // used for securing most api endpoints
    passport.use(this.strategies.jwt);

    app.use(passport.initialize());

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
