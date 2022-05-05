import dotenv from "dotenv";
import { injectable, singleton } from "tsyringe";

@injectable()
@singleton()
export class Configuration {
  public gravityFormsUri = `${process.env.GF_URI}/wp-json/gf/v2`;
  public gravityFormsId = `${process.env.GF_FORM_ID}`;
  public gravityFormsConsumerApiKey = `${process.env.GF_CONSUMER_API_KEY}`;
  public gravityFormsConsumerSecret = `${process.env.GF_CONSUMER_SECRET}`;

  public schedUri = `${process.env.SCHED_URI}/api/`;
  public schedApiKey = `${process.env.SCHED_API_KEY}`;

  public mongoDbUri = `${process.env.MONGODB_URI}`;

  public apiPort = this.parseIntWithDefault(process.env.API_PORT, 3000);

  public pollInterval = this.parseIntWithDefault(
    process.env.POLLINTERVAL,
    10 * 60 * 1000
  );

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
