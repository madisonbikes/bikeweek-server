import { injectable, singleton } from "tsyringe";
import { Configuration } from "./config";
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
    const client: MongoClient = new MongoClient(this.configuration.mongoDbUri);
    await client.connect();

    this.database = client.db("bikeweek");
    this.users = this.database.collection("users");
    this.gfFormFields = this.database.collection("gfFormFields");
    this.gfResponses = this.database.collection("gfResponses");
  }
}
