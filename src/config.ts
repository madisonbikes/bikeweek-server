import { config } from "dotenv";
import { resolve } from "path";
import { injectable, singleton } from "tsyringe";

@injectable()
@singleton()
export class Configuration {
  public gravityFormsUri = `${process.env.GF_SOURCE_URI}/wp-json/gf/v2`
  public gravityFormsId = process.env.GF_FORM_ID
}

// from dotenv samples:
// https://github.com/motdotla/dotenv/blob/master/examples/typescript/src/lib/env.ts
const file = resolve(__dirname, "../.env");
config({ path: file });
