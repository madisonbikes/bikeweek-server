import dotenv from "dotenv"
import { importer } from "./importer";
import { AddSession } from "./sched/types";
import { addSession, modifySession } from "./sched/api";

dotenv.config()

startup().then(_ => {
  // do a thing
});

async function startup(): Promise<void> {
  process.on("uncaughtException", (err) => {
    console.error(err);
    process.exit(1);
  });

  const results = await importer();

  // FIXME temporarily reduce size to 5 to avoid rate limits
  const smaller = results.slice(0, 5)

  let index = 1
  for(const event of smaller) {
    const modded = await modifySession({
      session_key: `Session ${index}`,
      name: event.name,
      description: event.description,
      session_start: "8:00 AM",
      session_end: "TBA",
      session_type: event.type
    })

    index++
    console.log(modded.text)
  }
  /*
  const sessions = await superagent
    .post(GET_SESSION_LIST_ENDPOINT)
    .set("Content-Type", "application/x-www-form-urlencoded")
    .set("User-Agent", "madisonbikeweek2021-importer/1.0.0")
    .send(request)
  const parsed = sessions.body
  console.log(JSON.stringify(parsed, null, 2))
   */
}