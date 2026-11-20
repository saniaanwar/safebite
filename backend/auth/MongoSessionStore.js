import session from "express-session";
import { createHash } from "node:crypto";
import { db } from "../db/connection.js";

const sessions = db.collection("sessions");
const storeId = (sid) => createHash("sha256").update(sid).digest("hex");
const expiresAt = (value) => new Date(value.cookie.expires);

export function ensureSessionIndexes() {
  return sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

// Implement the express-session store interface with the native MongoDB driver.
export default class MongoSessionStore extends session.Store { //Interesting I had not considered using an interface like this
  get(sid, callback) {
    sessions
      .findOne({ _id: storeId(sid), expiresAt: { $gt: new Date() } })
      .then((record) => callback(null, record ? JSON.parse(record.data) : null))
      .catch(callback);
  }

  set(sid, value, callback) {
    sessions
      .updateOne(
        { _id: storeId(sid) },
        { $set: { data: JSON.stringify(value), expiresAt: expiresAt(value) } },
        { upsert: true },
      )
      .then(() => callback(null))
      .catch(callback);
  }

  destroy(sid, callback) {
    sessions
      .deleteOne({ _id: storeId(sid) })
      .then(() => callback(null))
      .catch(callback);
  }

  touch(sid, value, callback) {
    sessions
      .updateOne(
        { _id: storeId(sid) },
        { $set: { expiresAt: expiresAt(value) } },
      )
      .then(() => callback(null))
      .catch(callback);
  }
}
