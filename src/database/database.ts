import { configuration } from "../config";
import { Collection, Db, MongoClient } from "mongodb";
import { logger, maskUriPassword } from "../utils";
import { DbBikeWeekEvent, DbStatus, DbUser, dbStatusSchema } from "./types";

class Database {
  private _users!: Collection<Omit<DbUser, "_id">>;
  private _gfFormFields!: Collection;
  private _gfResponses!: Collection;
  private _events!: Collection<Omit<DbBikeWeekEvent, "_id">>;
  private _status!: Collection<Omit<DbStatus, "_id">>;

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

  public async getStatus() {
    const status = (await this.database?.collection("status").findOne()) ?? {};
    return dbStatusSchema.parse(status);
  }

  public async setStatus(status: DbStatus) {
    await this._status.deleteMany({});
    await this._status.insertOne(status);
  }

  async start() {
    logger.info(`Connecting to ${maskUriPassword(configuration.mongoDbUri)}`);
    this.client = new MongoClient(configuration.mongoDbUri, {});
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

export const database = new Database();
