import superagent from "superagent";

import { entryResponseSchema, FormResponseSchema } from "./types";

import { injectable } from "tsyringe";
import { Configuration } from "../config";
import { Database } from "../database/database";
import { logger } from "../utils";

/** pull data out of GF REST service and dump into mongo */
@injectable()
export class Importer {
  constructor(private config: Configuration, private database: Database) {}

  async import(): Promise<void> {
    if (!this.isEnabled()) {
      logger.info("Gravity forms URI not provided, no form data importing");
      return;
    }

    const [formFields, responses] = await Promise.all([
      this.loadForms(),
      this.loadEntries(),
    ]);
    await this.database.gfFormFields.deleteMany({});
    await this.database.gfFormFields.insertMany(formFields.fields);

    await this.database.gfResponses.deleteMany({});
    await this.database.gfResponses.insertMany(responses.entries);
  }

  isEnabled() {
    return this.config.gravityFormsUri;
  }

  // FIXME support pagination for > 100 entries
  private async loadEntries() {
    const { body } = await superagent
      .get(`${this.config.gravityFormsUri}/entries`)
      .query({ form_ids: this.config.gravityFormsId })
      .query("paging[page_size]=100")
      .auth(
        this.config.gravityFormsConsumerApiKey,
        this.config.gravityFormsConsumerSecret
      );
    const result = entryResponseSchema.safeParse(body);
    if (!result.success) {
      logger.error(
        { responses: body, error: result.error },
        "Error parsing form responses"
      );
      throw new Error("error parsing form responses");
    }
    return result.data;
  }

  private async loadForms() {
    const { body } = await superagent
      .get(`${this.config.gravityFormsUri}/forms/${this.config.gravityFormsId}`)
      .auth(
        this.config.gravityFormsConsumerApiKey,
        this.config.gravityFormsConsumerSecret
      );
    const result = FormResponseSchema.safeParse(body);
    if (!result.success) {
      logger.error(
        { forms: body, error: result.error },
        "Error parsing form definitions"
      );
      throw new Error("error parsing form definitions");
    }
    return result.data;
  }
}
