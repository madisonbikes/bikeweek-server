import { injectable, singleton } from "tsyringe";
import { Configuration } from "../config";
import { Collection, Db, MongoClient } from "mongodb";

@injectable()
@singleton()
export class Database {
  public users!: Collection;
  public gfFormFields!: Collection;
  public gfResponses!: Collection;

  public database!: Db;

  constructor(private configuration: Configuration) {}

  async start(): Promise<void> {
    const client: MongoClient = new MongoClient(
      this.configuration.mongoDbUri,
      {}
    );
    await client.connect();

    this.database = client.db("bikeweek");

    const collectionList = this.database.listCollections(
      { name: "users" },
      { nameOnly: true }
    );
    if (!(await collectionList.hasNext())) {
      this.database.createCollection("users");
      console.log("creating collection");
    }
    collectionList.close();

    this.users = this.database.collection("users");
    this.users.createIndex({ username: 1 });
    this.gfFormFields = this.database.collection("gfFormFields");
    this.gfResponses = this.database.collection("gfResponses");
  }
}
