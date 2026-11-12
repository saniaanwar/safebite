import { ObjectId } from "mongodb";
import { db } from "./connection.js";

const CATEGORY_ORDER = [
  "Produce", "Dairy", "Meat", "Seafood", "Bakery",
  "Snacks", "Frozen", "Beverages", "Pantry", "Baby Food",
];

export async function listRecalls({
  search = "",
  category = "",
  classification = "",
  status = "",
  page = 1,
  pageSize = 8,
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

  const [recalls, total] = await Promise.all([
    collection
      .aggregate([
        { $match: matches },
        // categories position for sorting
        {
          $addFields: {
            categoryOrder: { $indexOfArray: [CATEGORY_ORDER, "$category"] },
          },
        },
        { $sort: { categoryOrder: 1, product: 1, _id: 1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
        { $project: { categoryOrder: 0 } },
      ])
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