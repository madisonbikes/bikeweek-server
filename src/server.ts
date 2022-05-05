import { injectable } from "tsyringe";
import Koa from "koa";
import KoaRouter from "@koa/router";
import { Configuration } from "./config";

@injectable()
export class ApiServer {
  constructor(private configuration: Configuration) {}

  async start(): Promise<void> {
    const app = new Koa();
    const router = new KoaRouter();
    router.get("/", (ctx) => {
      ctx.response.body = "Hello World";
    });

    app.listen(this.configuration.apiPort, () => {
      console.log(
        `Server listening on http://localhost:${this.configuration.apiPort}`
      );
    });
  }
}
