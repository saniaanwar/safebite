import { ObjectId } from "mongodb";
import { db } from "./connection.js";

const reports = db.collection("reports");

function requireAuthorId(authorId) {
  if (typeof authorId !== "string" || authorId.trim().length === 0) {
    throw new TypeError("A non-empty author ID is required.");
  }

  return authorId.trim();
}

function toReportObjectId(reportId) {
  if (typeof reportId !== "string" || !ObjectId.isValid(reportId)) {
    return null;
  }

  return new ObjectId(reportId);
}

// Read reports for one fictional restaurant, newest first.
export async function listReports(restaurantId) {
  return reports
    .find({ restaurantId, isSynthetic: true })
    .sort({ createdAt: -1, _id: -1 })
    .toArray();
}

export async function createReport(
  { restaurantId, visitDate, description },
  authorId,
) {
  const now = new Date();

  // Accept ownership separately from the report's editable fields.
  const report = {
    restaurantId,
    authorId: requireAuthorId(authorId),
    visitDate,
    description,
    isSynthetic: true,
    createdAt: now,
    updatedAt: now,
  };

  const result = await reports.insertOne(report);

  return { ...report, _id: result.insertedId };
}

export async function updateReport(
  reportId,
  authorId,
  { visitDate, description },
) {
  const ownerId = requireAuthorId(authorId);
  const objectId = toReportObjectId(reportId);

  if (!objectId) {
    return null;
  }

  // Match ownership in the same operation that changes the report.
  return reports.findOneAndUpdate(
    { _id: objectId, authorId: ownerId, isSynthetic: true },
    {
      $set: {
        visitDate,
        description,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after", includeResultMetadata: false },
  );
}

export async function deleteReport(reportId, authorId) {
  const ownerId = requireAuthorId(authorId);
  const objectId = toReportObjectId(reportId);

  if (!objectId) {
    return false;
  }

  const result = await reports.deleteOne({
    _id: objectId,
    authorId: ownerId,
    isSynthetic: true,
  });

  return result.deletedCount === 1;
}
