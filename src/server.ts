import { injectable } from "tsyringe";
import Koa from "koa";
import KoaRouter from "@koa/router";
import koaBody from "koa-body";
import { Configuration } from "./config";
import koaPassport from "koa-passport";
import koaSession from "koa-session";

@injectable()
export class ApiServer {
  constructor(private configuration: Configuration) {}

  async start(): Promise<void> {
    const app = new Koa();

    app.use(koaBody());

    app.use(koaSession(app));

    app.use(koaPassport.initialize());
    app.use(koaPassport.session());

    const router = new KoaRouter();
    router.get("/", (ctx) => {
      ctx.response.body = "Hello World";
    });
    app.use(router.routes());

    app.listen(this.configuration.apiPort, () => {
      console.log(
        `Server listening on http://localhost:${this.configuration.apiPort}`
      );
    });
  }
}
