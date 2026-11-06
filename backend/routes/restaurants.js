import express from "express";
import { listRestaurants } from "../db/inspections.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const {
    name = "",
    neighborhood = "",
    result = "",
    page = "1",
    pageSize = "10",
  } = req.query;

  // Reject repeated or non-text query values before processing them.
  const values = [name, neighborhood, result, page, pageSize];

  if (values.some((value) => typeof value !== "string")) {
    return res.status(400).json({
      error: "Each query parameter must have one text value.",
    });
  }

  const normalizedResult = result.trim().toLowerCase();

  if (!["", "pass", "fail"].includes(normalizedResult)) {
    return res.status(400).json({
      error: "result must be pass, fail, or empty.",
    });
  }

  const pageNumber = Number(page);
  const pageSizeNumber = Number(pageSize);

  const validPage = Number.isSafeInteger(pageNumber) && pageNumber >= 1;
  const validPageSize =
    Number.isSafeInteger(pageSizeNumber) &&
    pageSizeNumber >= 1 &&
    pageSizeNumber <= 50;

  const validOffset = Number.isSafeInteger((pageNumber - 1) * pageSizeNumber);

  if (!validPage || !validPageSize || !validOffset) {
    return res.status(400).json({
      error:
        "Use a valid positive integer page and a pageSize between 1 and 50.",
    });
  }

  const data = await listRestaurants({
    name: name.trim(),
    neighborhood: neighborhood.trim(),
    result: normalizedResult,
    page: pageNumber,
    pageSize: pageSizeNumber,
  });

  res.json(data);
});

export default router;
