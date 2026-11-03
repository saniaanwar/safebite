import { readFile } from "node:fs/promises";
import { client, db } from "../db/connection.js";

try {
  // Load the generated inspections.
  const inspections = JSON.parse(
    await readFile(
      new URL("./inspections.generated.json", import.meta.url),
      "utf8",
    ),
  );

  if (!Array.isArray(inspections) || inspections.length === 0) {
    throw new Error("Expected a non-empty array of inspections.");
  }

  // Validate matching fields before writing.
  const operations = inspections.map((inspection) => {
    if (
      typeof inspection?.restaurantId !== "string" ||
      !inspection.restaurantId ||
      typeof inspection.inspectionDate !== "string" ||
      !inspection.inspectionDate ||
      inspection.isSynthetic !== true
    ) {
      throw new Error(
        "An inspection has invalid identifiers or synthetic flag.",
      );
    }

    return {
      updateOne: {
        filter: {
          restaurantId: inspection.restaurantId,
          inspectionDate: inspection.inspectionDate,
          isSynthetic: true,
        },
        update: { $set: inspection },
        upsert: true,
      },
    };
  });

  await client.connect();
  const collection = db.collection("inspections");

  // Insert missing records or update existing matches.
  const result = await collection.bulkWrite(operations);
  const total = await collection.countDocuments({ isSynthetic: true });

  console.log("Database:", db.databaseName);
  console.log("Inserted:", result.upsertedCount);
  console.log("Matched:", result.matchedCount);
  console.log("Total synthetic inspections:", total);
} catch (error) {
  console.error("Inspection seed failed:", error.message);
  process.exitCode = 1;
} finally {
  // Release this script's connection.
  await client.close();
}
