import superagent from "superagent";
import csv from "csv-parser";
import tempy from "tempy";
import fs from "fs";

export type ImportedEvent = {
  name: string,
  event_url: string,
  description: string,
  sponsor: string,
  sponsor_urls: string,
  maps_description: string,
  maps_query: string,
  maps_placeid?: string,
  location_free?: string
  type: string,
  days: string,
  time: string,
  outside_of_madison: string,
}

export async function importer(): Promise<ImportedEvent[]> {
  // this is the 2019 list
  const data = await superagent.get(`${process.env.SOURCE_URI}/export?format=csv&gid=0`);
  const tempFile = tempy.file({ name: "events.csv" });
  await fs.promises.writeFile(tempFile, data.text);
  const results = await extractData(tempFile);
  await fs.promises.rm(tempFile);
  return results as ImportedEvent[]
}

async function extractData(filename: string) {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    fs.createReadStream(filename)
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (e) => {
        reject(e)
      })
  });
}