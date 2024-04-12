import express from "express";
import events from "./events";
import users from "./users";
import session from "./session";
import info from "./info";

function routes() {
  return express
    .Router()
    .use("/info", info.routes())
    .use("/session", session.routes())
    .use("/users", users.routes())
    .use("/events", events.routes());
}

export default { routes };
