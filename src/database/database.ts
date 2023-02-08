import { injectable, singleton } from "tsyringe";
import { Configuration } from "../config";
import { Collection, Db, MongoClient } from "mongodb";
import { logger } from "../utils/logger";

export type Status = {
  lastSchedSync?: Date;
};

@injectable()
@singleton()
export class Database {
  private _users!: Collection;
  private _gfFormFields!: Collection;
  private _gfResponses!: Collection;
  private _events!: Collection;
  private _status!: Collection;

  private client?: MongoClient;
  private database?: Db;

  public get users() {
    return this._users;
  }

  public get events() {
    return this._events;
  }

  public get gfFormFields() {
    return this._gfFormFields;
  }

  public get gfResponses() {
    return this._gfResponses;
  }

  public async getStatus(): Promise<Status> {
    const status = (await this.database
      ?.collection("status")
      .findOne()) as unknown as Status;
    if (!status) {
      return {};
    } else {
      return status;
    }
  }

  public async setStatus(status: Status) {
    await this._status.deleteMany({});
    await this._status.insertOne(status);
  }

  constructor(private configuration: Configuration) {}

  async start(): Promise<void> {
    logger.info(`Connecting to ${this.configuration.mongoDbUri}`);
    this.client = new MongoClient(this.configuration.mongoDbUri, {});
    await this.client.connect();

    this.database = this.client.db();

    this._users = this.database.collection("users");
    await this._users.createIndex({ username: 1 });

    this._events = this.database.collection("events");
    await this._events.createIndex({ id: 1 });

    this._gfFormFields = this.database.collection("gfFormFields");
    this._gfResponses = this.database.collection("gfResponses");
    this._status = this.database.collection("status");
  }

  async stop(): Promise<void> {
    this.database = undefined;

    await this.client?.close();
    this.client = undefined;
  }
}
