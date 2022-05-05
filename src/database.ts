import { injectable } from "tsyringe";
import { Configuration } from "./config";
import { Collection, Db, MongoClient } from "mongodb";

@injectable()
export class Database {
  public testCollection!: Collection;
  public database!: Db;

  constructor(private configuration: Configuration) {}

  async start(): Promise<void> {
    const client: MongoClient = new MongoClient(this.configuration.mongoDbUri);
    await client.connect();

    this.database = client.db("bikeweek");
    this.testCollection = this.database.collection("testCollection");
  }
}
