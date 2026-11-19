import { Router } from "express";
import { ObjectId } from "mongodb";
import {
  createGroceryItem,
  deleteGroceryItem,
  listGroceryItems,
  updateGroceryItem,
} from "../db/groceryItems.js";
import { requireUser } from "../middleware/requireUser.js";
import { requireCsrf } from "../middleware/csrf.js";

const router = Router();

function validateName(req, res, next) {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";

  if (name.length < 2 || name.length > 60) {
    return res
      .status(400)
      .json({ error: "Item names must be between 2 and 60 characters." });
  }

  res.locals.itemName = name;
  return next();
}

function requireItemId(req, res, next) {
  if (!ObjectId.isValid(req.params.itemId)) {
    return res.status(400).json({ error: "Use a valid item ID." });
  }

  return next();
}

router.get("/", requireUser, async (req, res) => {
  const items = await listGroceryItems(res.locals.userId);

  res.set("Cache-Control", "no-store");
  res.json({ items });
});

router.post("/", requireUser, requireCsrf, validateName, async (req, res) => {
  try {
    const item = await createGroceryItem(
      res.locals.userId,
      res.locals.itemName,
    );
    res.status(201).json({ item });
  } catch (error) {
    // the shared error handler would hide the message of a full list
    if (error.status === 409) {
      return res.status(409).json({ error: error.message });
    }
    throw error;
  }
});

router.put(
  "/:itemId",
  requireUser,
  requireCsrf,
  requireItemId,
  validateName,
  async (req, res) => {
    const item = await updateGroceryItem(
      req.params.itemId,
      res.locals.userId,
      res.locals.itemName,
    );

    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    res.json({ item });
  },
);

router.delete(
  "/:itemId",
  requireUser,
  requireCsrf,
  requireItemId,
  async (req, res) => {
    const deleted = await deleteGroceryItem(
      req.params.itemId,
      res.locals.userId,
    );

    if (!deleted) {
      return res.status(404).json({ error: "Item not found." });
    }

    res.status(204).end();
  },
);

export default router;
