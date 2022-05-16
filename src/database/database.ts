import { injectable, singleton } from "tsyringe";
import { Configuration } from "../config";
import { Collection, Db, MongoClient } from "mongodb";

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

  private _database!: Db;

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
    const status = (await this._database
      .collection("status")
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
    const client: MongoClient = new MongoClient(
      this.configuration.mongoDbUri,
      {}
    );
    await client.connect();

    this._database = client.db("bikeweek");

    const collectionList = this._database.listCollections(
      { name: "users" },
      { nameOnly: true }
    );
    if (!(await collectionList.hasNext())) {
      this._database.createCollection("users");
      console.log("creating collection");
    }
    collectionList.close();

    this._users = this._database.collection("users");
    this._users.createIndex({ username: 1 });
    this._events = this._database.collection("events");
    this._gfFormFields = this._database.collection("gfFormFields");
    this._gfResponses = this._database.collection("gfResponses");
    this._status = this._database.collection("status");
  }
}
