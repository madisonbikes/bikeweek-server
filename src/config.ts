import { config } from "dotenv";
import { resolve } from "path";
import { injectable, singleton } from "tsyringe";
import { parse } from "date-fns";

@injectable()
@singleton()
export class Configuration {
  public gravityFormsUri = `${process.env.GF_URI}/wp-json/gf/v2`;
  public gravityFormsId = `${process.env.GF_FORM_ID}`
  public gravityFormsConsumerApiKey = `${process.env.GF_CONSUMER_API_KEY}`;
  public gravityFormsConsumerSecret = `${process.env.GF_CONSUMER_SECRET}`;

  public schedUri = `${process.env.SCHED_URI}/api/`;
  public schedApiKey = `${process.env.SCHED_API_KEY}`;

  public EVENT_START = "2021-09-11";
  public EVENT_START_DATE = parse(this.EVENT_START, "yyyy-MM-dd", new Date());
}

// from dotenv samples:
// https://github.com/motdotla/dotenv/blob/master/examples/typescript/src/lib/env.ts
const file = resolve(__dirname, "../.env");
console.log(`Loading configuration from $file`)
config({ path: file });
