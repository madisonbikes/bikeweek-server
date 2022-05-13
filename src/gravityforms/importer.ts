import superagent from "superagent";

import { EntryResponse, FormResponse } from "./types";

import { injectable } from "tsyringe";
import { Configuration } from "../config";
import { Database } from "../database/database";

/** pull data out of GF REST service and dump into mongo */
@injectable()
export class Importer {
  constructor(private config: Configuration, private database: Database) {}

  async import(): Promise<void> {
    const [formFields, responses] = await Promise.all([
      this.loadForms(),
      this.loadEntries(),
    ]);

    await this.database.gfFormFields.deleteMany({});
    await this.database.gfFormFields.insertMany(formFields.fields);

    await this.database.gfResponses.deleteMany({});
    await this.database.gfResponses.insertMany(responses.entries);
  }

  // FIXME support pagination for > 100 entries
  private async loadEntries(): Promise<EntryResponse> {
    const { body } = await superagent
      .get(`${this.config.gravityFormsUri}/entries`)
      .query({ form_ids: this.config.gravityFormsId })
      .query("paging[page_size]=100")
      .auth(
        this.config.gravityFormsConsumerApiKey,
        this.config.gravityFormsConsumerSecret
      );
    return body;
  }

  private async loadForms(): Promise<FormResponse> {
    const { body } = await superagent
      .get(`${this.config.gravityFormsUri}/forms/${this.config.gravityFormsId}`)
      .auth(
        this.config.gravityFormsConsumerApiKey,
        this.config.gravityFormsConsumerSecret
      );
    return body;
  }
}
