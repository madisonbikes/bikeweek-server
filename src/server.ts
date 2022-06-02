import { injectable } from "tsyringe";
import { Configuration } from "./config";
import express from "express";
import passport from "passport";
import { ApiRoutes } from "./routes";
import { Strategies } from "./security/authentication";
import cors from "cors";
import http, { Server } from "http";

@injectable()
export class ApiServer {
  constructor(
    private configuration: Configuration,
    private apiRoutes: ApiRoutes,
    private strategies: Strategies
  ) {}

  server: Server | undefined;

  async create(): Promise<Server> {
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
    this.server = http.createServer(app);
    return this.server;
  }

  async start(): Promise<void> {
    await this.create();
    this.server?.listen(this.configuration.serverPort, () => {
      console.log(
        `Server listening on http://localhost:${this.configuration.serverPort}`
      );
    });
  }

  async stop(): Promise<void> {
    this.server?.close();
  }
}
