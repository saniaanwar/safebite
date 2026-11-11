import { ObjectId } from "mongodb";
import { db } from "./connection.js";

export async function listRecalls({
  search = "",
  category = "",
  classification = "",
  status = "",
  page = 1,
  pageSize = 10,
} = {}) {
  const matches = {};

  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    matches.$or = [
      { product: { $regex: escapedSearch, $options: "i" } },
      { brand: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  if (category) {
    matches.category = category;
  }

  if (classification) {
    matches.classification = classification;
  }

  if (status) {
    matches.status = status;
  }

  const collection = db.collection("recalls");

  // runs page query and the total count
  const [recalls, total] = await Promise.all([
    collection
      .find(matches)
      .sort({ recallDate: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    collection.countDocuments(matches),
  ]);

  return {
    recalls,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getRecallById(recallId) {
  return db.collection("recalls").findOne({ _id: new ObjectId(recallId) });
}