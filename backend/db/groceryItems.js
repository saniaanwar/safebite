import { ObjectId } from "mongodb";
import { db } from "./connection.js";

const groceryItems = db.collection("groceryItems");
const recalls = db.collection("recalls");

const MAX_ITEMS = 100;

function toObjectId(id) {
  return typeof id === "string" && ObjectId.isValid(id)
    ? new ObjectId(id)
    : null;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// recalls whose product or brand contains the item name in grocery list
export async function findRecallMatches(name) {
  // match at the start of a word so "egg" does not match "veggie"
  const pattern = { $regex: `\\b${escapeRegex(name)}`, $options: "i" };

  return recalls
    .find({
      status: "Ongoing",
      $or: [{ product: pattern }, { brand: pattern }],
    })
    .project({
      product: 1,
      brand: 1,
      packageSize: 1,
      reason: 1,
      classification: 1,
      consumerAction: 1,
    })
    .sort({ recallDate: -1 })
    .toArray();
}

async function withRecalls(item) {
  return { ...item, recalls: await findRecallMatches(item.name) };
}

export async function listGroceryItems(ownerId) {
  const items = await groceryItems
    .find({ ownerId })
    .sort({ createdAt: -1, _id: -1 })
    .toArray();

  return Promise.all(items.map(withRecalls));
}

export async function createGroceryItem(ownerId, name) {
  const count = await groceryItems.countDocuments({ ownerId });

  if (count >= MAX_ITEMS) {
    const error = new Error(`Your list can hold up to ${MAX_ITEMS} items.`);
    error.status = 409;
    throw error;
  }

  const now = new Date();
  const item = { ownerId, name, createdAt: now, updatedAt: now };
  const result = await groceryItems.insertOne(item);

  return withRecalls({ ...item, _id: result.insertedId });
}

export async function updateGroceryItem(itemId, ownerId, name) {
  const _id = toObjectId(itemId);
  if (!_id) return null;

  const item = await groceryItems.findOneAndUpdate(
    { _id, ownerId },
    { $set: { name, updatedAt: new Date() } },
    { returnDocument: "after", includeResultMetadata: false },
  );

  return item ? withRecalls(item) : null;
}

export async function deleteGroceryItem(itemId, ownerId) {
  const _id = toObjectId(itemId);
  if (!_id) return false;

  const result = await groceryItems.deleteOne({ _id, ownerId });
  return result.deletedCount === 1;
}
