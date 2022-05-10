import dotenv from "dotenv";
import { injectable, singleton } from "tsyringe";

@injectable()
@singleton()
export class Configuration {
  public readonly gravityFormsUri = `${process.env.GF_URI}/wp-json/gf/v2`;
  public readonly gravityFormsId = `${process.env.GF_FORM_ID}`;
  public readonly gravityFormsConsumerApiKey = `${process.env.GF_CONSUMER_API_KEY}`;
  public readonly gravityFormsConsumerSecret = `${process.env.GF_CONSUMER_SECRET}`;

  public readonly schedUri = `${process.env.SCHED_URI}/api/`;
  public readonly schedApiKey = `${process.env.SCHED_API_KEY}`;

  public readonly mongoDbUri = `${process.env.MONGODB_URI}`;

  public readonly apiPort = this.parseIntWithDefault(
    process.env.API_PORT,
    3001
  );

  public readonly jsonWebTokenSecret =
    process.env.JSONWEBTOKEN_SECRET || "defaultsecretnotsecure";

  public readonly pollInterval = this.parseIntWithDefault(
    process.env.POLLINTERVAL,
    10 * 60 * 1000
  );

  public readonly dev = process.env.NODE_ENV === "dev";

  private parseIntWithDefault(
    value: string | undefined,
    defaultValue: number
  ): number {
    let retval = defaultValue;
    if (value) {
      retval = Number(defaultValue);
      if (isNaN(retval)) {
        retval = defaultValue;
      }
    }
    return retval;
  }
}

// this has to run first outside of constructor
const result = dotenv.config();
if (result.error) {
  throw result.error;
}
