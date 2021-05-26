import dotenv from "dotenv"
import { ImportedEvent, importer } from "./importer";
import { addSession, deleteSession, listSessions, modifySession } from "./sched/api";
import crypto from "crypto"
import converter from "showdown"

dotenv.config()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const sessionList = sessionListResponse.value
  const existingKeys = new Set(sessionList.map((item) => {
    return item.event_key
  }))
  const handledKeys = new Set<string>()

  // FIXME temporarily reduce size to 5 to avoid rate limits
  const smaller = importResults.slice(0, 5)

  for(const event of smaller) {
    const key = generateKey(event)
    const htmlDescription = new converter.Converter().makeHtml(event.description).replaceAll("\\", "")

    const base = {
      session_key: key,
      name: event.name,
      description: htmlDescription,
      // format: YYYY-MM-DD HH:MM
      session_start: "8:00 AM",
      session_end: "TBA",
      session_type: event.type,
      media_url: event.event_url
    }
    if(existingKeys.has(key)) {
      const modded = await modifySession(base)
      if(modded.isError()) {
        console.log(`${key} error: ${modded}`)
      } else {
        console.log(`${key} modified ok`)
      }
    } else {
      const modded = await addSession(base)
      if(modded.isError()) {
        console.log(`${key} error: ${modded}`)
      } else {
        console.log(`${key} added ok`)
      }
    }
    handledKeys.add(key)
  }

  // remove handledkeys from the total key list
  for(const key of handledKeys) {
    existingKeys.delete(key)
  }

  // delete any remaining sessions
  // FIXME this should probably be removed once the sessions have stabilized
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