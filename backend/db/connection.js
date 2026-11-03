import "dotenv/config";
import { MongoClient } from "mongodb";

// Read the database settings.
const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB;

if (!uri || !databaseName) {
  throw new Error("MONGODB_URI and MONGODB_DB are required in backend/.env.");
}

// Share one client across database operations.
export const client = new MongoClient(uri);
export const db = client.db(databaseName);
