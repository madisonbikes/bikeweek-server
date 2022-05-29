import dotenv from "dotenv";
import { injectable, singleton } from "tsyringe";

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
  public readonly gravityFormsUri = `${process.env.GF_URI}/wp-json/gf/v2`;
  public readonly gravityFormsId = `${process.env.GF_FORM_ID}`;
  public readonly gravityFormsConsumerApiKey = `${process.env.GF_CONSUMER_API_KEY}`;
  public readonly gravityFormsConsumerSecret = `${process.env.GF_CONSUMER_SECRET}`;

  public readonly schedUri: string | undefined;
  public readonly schedApiKey: string | undefined;

  public readonly reactStaticRootDir = process.env.STATIC_ROOT_DIR;

  public readonly mongoDbUri = `${process.env.MONGODB_URI}`;

  public readonly serverPort = this.parseIntWithDefault(process.env.PORT, 3001);

  public readonly jwt: JwtConfiguration;

  public readonly pollInterval = this.parseIntWithDefault(
    process.env.POLLINTERVAL,
    10 * 60 * 1000
  );

  public readonly enableCors = process.env.ENABLE_CORS === "true";

  public readonly dev = isDev;

  constructor() {
    if (process.env.SCHED_URI) {
      this.schedUri = `${process.env.SCHED_URI}/api/`;
    } else {
      this.schedUri = undefined;
    }
    if (process.env.SCHED_API_KEY) {
      this.schedApiKey = `${process.env.SCHED_API_KEY}`;
    } else {
      this.schedApiKey = undefined;
    }
    this.jwt = {
      secret: process.env.JSONWEBTOKEN_SECRET || "defaultsecretnotsecure",
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
    if (value) {
      retval = Number(value);
      if (isNaN(retval)) {
        retval = defaultValue;
      }
    }
    return retval;
  }
}

// this has to run first outside of constructor
const result = dotenv.config();
if (result.error && isDev) {
  console.log(result.error);
}
