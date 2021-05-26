import dotenv from "dotenv"
import { ImportedEvent, importer } from "./importer";
import { addSession, deleteSession, listSessions, modifySession } from "./sched/api";
import { SessionListResponse } from "./sched/types";
import crypto from "crypto"

dotenv.config()

startup().then(_ => {
  // do a thing
});

async function startup(): Promise<void> {
  process.on("uncaughtException", (err) => {
    console.error(err);
    process.exit(1);
  });

  const importResults = await importer();

  const sessionListResponse = await listSessions()
  if(sessionListResponse.isError()) {
    console.error(sessionListResponse.value)
    process.exit(1)
  }

  const sessionList: SessionListResponse[] = sessionListResponse.value
  const existingKeys = new Set(sessionList.map((item) => {
    return item.event_key
  }))
  const handledKeys = new Set<string>()

  // FIXME temporarily reduce size to 5 to avoid rate limits
  const smaller = importResults.slice(0, 5)

  for(const event of smaller) {
    const key = generateKey(event)

    const base = {
      session_key: key,
      name: event.name,
      description: event.description,
      session_start: "8:00 AM",
      session_end: "TBA",
      session_type: event.type
    }
    if(existingKeys.has(key)) {
      const modded = await modifySession(base)
      if(modded.isError()) {
        console.log(`${key} error: ${modded}`)
      } else {
        console.log(`${key} modified ok`)
      }
      handledKeys.add(key)
    } else {
      const modded = await addSession(base)
      if(modded.isError()) {
        console.log(`${key} error: ${modded}`)
      } else {
        console.log(`${key} added ok`)
      }
      handledKeys.add(key)
    }
  }
  for(const key of handledKeys) {
    existingKeys.delete(key)
  }
  for(const key of existingKeys) {
    const result = await deleteSession({session_key: key})
    console.log(result)
  }
}

function generateKey(event: ImportedEvent): string {
  return crypto
    .createHash("md5")
    .update(event.name)
    .digest("base64")
    .replaceAll("=", "")
}