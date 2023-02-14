import { injectable, singleton } from "tsyringe";
import { initEnv } from "./utils/env";

initEnv();

const isDev = process.env.NODE_ENV === "development";

export type JwtConfiguration = {
  secret: string;
  issuer: string;
  audience: string;
  expiresIn: string;
};

@injectable()
@singleton()
export class Configuration {
  public readonly gravityFormsUri;
  public readonly gravityFormsId = process.env.GF_FORM_ID ?? "";
  public readonly gravityFormsConsumerApiKey =
    process.env.GF_CONSUMER_API_KEY ?? "";
  public readonly gravityFormsConsumerSecret =
    process.env.GF_CONSUMER_SECRET ?? "";

  public readonly schedUri;
  public readonly schedApiKey = process.env.SCHED_API_KEY ?? "";

  public readonly reactStaticRootDir = process.env.STATIC_ROOT_DIR ?? "";

  public readonly mongoDbUri = process.env.MONGODB_URI ?? "";

  public readonly serverPort = this.parseIntWithDefault(process.env.PORT, 3001);

  public readonly jwt: JwtConfiguration;

  public readonly pollInterval = this.parseIntWithDefault(
    process.env.POLLINTERVAL,
    10 * 60 * 1000
  );

  public readonly enableCors = Boolean(process.env.ENABLE_CORS);

  public readonly dev = isDev;

  constructor() {
    if (process.env.GF_URI !== undefined && process.env.GF_URI !== "") {
      this.gravityFormsUri = `${process.env.GF_URI}/wp-json/gf/v2`;
    } else {
      this.gravityFormsUri = "";
    }

    if (process.env.SCHED_URI !== undefined && process.env.SCHED_URI !== "") {
      this.schedUri = `${process.env.SCHED_URI}/api/`;
    } else {
      this.schedUri = "";
    }
    this.jwt = {
      secret: process.env.JSONWEBTOKEN_SECRET ?? "defaultsecretnotsecure",
      audience: "bikeweekadmin",
      issuer: "bikeweekadmin",
      expiresIn: "14d",
    };
  }

  private parseIntWithDefault(
    value: string | undefined,
    defaultValue: number
  ): number {
    let retval = defaultValue;
    if (value !== undefined) {
      retval = Number(value);
      if (isNaN(retval)) {
        retval = defaultValue;
      }
    }
    return retval;
  }
}
