import express from "express";
import { getRecallById, listRecalls } from "../db/recalls.js";

const router = express.Router();

const CATEGORIES = [
  "Produce", "Dairy", "Meat", "Seafood", "Bakery",
  "Snacks", "Frozen", "Beverages", "Pantry", "Baby Food",
];
const CLASSIFICATIONS = ["Class I", "Class II", "Class III"];
const STATUSES = ["Ongoing", "Completed", "Terminated"];

router.get("/", async (req, res) => {
  const {
    search = "",
    category = "",
    classification = "",
    status = "",
    page = "1",
    pageSize = "10",
  } = req.query;

  // rejects repeated/non-text query values
  const values = [search, category, classification, status, page, pageSize];

  if (values.some((value) => typeof value !== "string")) {
    return res.status(400).json({
      error: "Each query parameter must have one text value.",
    });
  }

  const filters = {
    category: category.trim(),
    classification: classification.trim(),
    status: status.trim(),
  };

  if (filters.category && !CATEGORIES.includes(filters.category)) {
    return res.status(400).json({ error: "Unknown category." });
  }

  if (filters.classification && !CLASSIFICATIONS.includes(filters.classification)) {
    return res.status(400).json({
      error: "classification must be Class I, Class II, or Class III.",
    });
  }

  if (filters.status && !STATUSES.includes(filters.status)) {
    return res.status(400).json({
      error: "status must be Ongoing, Completed, or Terminated.",
    });
  }

  const pageNumber = Number(page);
  const pageSizeNumber = Number(pageSize);

  const validPage = Number.isSafeInteger(pageNumber) && pageNumber >= 1;
  const validPageSize =
    Number.isSafeInteger(pageSizeNumber) &&
    pageSizeNumber >= 1 &&
    pageSizeNumber <= 50;

  if (!validPage || !validPageSize) {
    return res.status(400).json({
      error:
        "Use a valid positive integer page and a pageSize between 1 and 50.",
    });
  }

  const data = await listRecalls({
    search: search.trim(),
    ...filters,
    page: pageNumber,
    pageSize: pageSizeNumber,
  });

  res.json(data);
});

router.get("/:recallId", async (req, res) => {
  const { recallId } = req.params;

  if (!/^[a-f\d]{24}$/i.test(recallId)) {
    return res.status(400).json({ error: "Invalid recall ID." });
  }

  const recall = await getRecallById(recallId);

  if (!recall) {
    return res.status(404).json({ error: "Recall not found." });
  }

  res.json(recall);
});

export default router;