import { importer } from "./importer";

startup().then(_ => {
  // do a thing
});

async function startup(): Promise<void> {
  process.on("uncaughtException", (err) => {
    console.error(err);
    process.exit(1);
  });

  await importer();
}