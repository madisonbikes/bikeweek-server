import { injectable } from "tsyringe";
import { Configuration } from "./config";
import express from "express";
import passport from "passport";
import cookieParser from "cookie-parser";
import session from "express-session";

@injectable()
export class ApiServer {
  constructor(private configuration: Configuration) {}

  async start(): Promise<void> {
    const app = express();

    app.use(express.json());
    app.use(cookieParser());

    app.use(
      session({
        secret: "bikeweeksecretcode",
        resave: true,
        saveUninitialized: true,
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    const router = express.Router();
    router.get("/", (req, res) => {
      res.json({ message: "Hello World" });
    });
    app.use(router);

    app.listen(this.configuration.apiPort, () => {
      console.log(
        `Server listening on http://localhost:${this.configuration.apiPort}`
      );
    });
  }
}
