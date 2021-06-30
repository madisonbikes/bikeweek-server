import { config } from "dotenv";
import { resolve } from "path";
import { injectable, singleton } from "tsyringe";
import { parse } from "date-fns";

@injectable()
@singleton()
export class Configuration {
  public gravityFormsUri = `${process.env.GF_SOURCE_URI}/wp-json/gf/v2`
  public gravityFormsId = process.env.GF_FORM_ID
}

export const EVENT_START = "2021-09-11";
export const EVENT_START_DATE = parse(EVENT_START, "yyyy-MM-dd", new Date());

// from dotenv samples:
// https://github.com/motdotla/dotenv/blob/master/examples/typescript/src/lib/env.ts
const file = resolve(__dirname, "../.env");
config({ path: file });
