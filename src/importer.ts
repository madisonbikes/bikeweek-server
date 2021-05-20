import superagent from "superagent";
import csv from "csv-parser";
import tempy from "tempy";
import fs from "fs";

export async function importer() {
  // this is the 2019 list
  const data = await superagent.get("https://docs.google.com/spreadsheets/d/1L4jwv6lg8a95X7AgYNUCIS0uf99XqZlD0WkgP_w9ZMI/export?format=csv&gid=0");
  const tempFile = tempy.file({ name: "events.csv" });
  await fs.promises.writeFile(tempFile, data.text);
  const results = await extractData(tempFile);
  await fs.promises.rm(tempFile);
  console.log(results);
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