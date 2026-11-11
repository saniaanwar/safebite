import { Router } from "express";
import { ObjectId } from "mongodb";
import { getRestaurantDetails } from "../db/inspections.js";
import {
  createReport,
  deleteReport,
  listReports,
  updateReport,
} from "../db/reports.js";
import {
  getReportAuthorId,
  requireReportUser,
} from "../middleware/reportAuth.js";
import { validateReportInput } from "../validation/reports.js";

const router = Router();

async function requireRestaurant(req, res, next) {
  const { restaurantId } = req.params;

  if (!/^demo-rest-\d{3}$/.test(restaurantId)) {
    return res.status(400).json({
      error: "Use a restaurant ID such as demo-rest-001.",
    });
  }

  const details = await getRestaurantDetails(restaurantId);

  if (!details) {
    return res.status(404).json({ error: "Restaurant not found." });
  }

  return next();
}

function requireReportId(req, res, next) {
  if (!ObjectId.isValid(req.params.reportId)) {
    return res.status(400).json({ error: "Use a valid report ID." });
  }

  return next();
}

function validateReportBody(req, res, next) {
  const { errors, value } = validateReportInput(req.body);

  if (!value) {
    return res.status(400).json({
      error: "Check the report fields.",
      errors,
    });
  }

  res.locals.reportInput = value;
  return next();
}

// Public reading, with the signed-in user's ID for author controls.
router.get(
  "/restaurants/:restaurantId/reports",
  requireRestaurant,
  async (req, res) => {
    const currentUserId = getReportAuthorId(req);
    const reports = await listReports(req.params.restaurantId);

    res.set("Cache-Control", "no-store");
    res.json({ reports, currentUserId });
  },
);

router.post(
  "/restaurants/:restaurantId/reports",
  requireReportUser,
  requireRestaurant,
  validateReportBody,
  async (req, res) => {
    const report = await createReport(
      {
        restaurantId: req.params.restaurantId,
        ...res.locals.reportInput,
      },
      res.locals.reportAuthorId,
    );

    res.status(201).json({ report });
  },
);

router.put(
  "/reports/:reportId",
  requireReportUser,
  requireReportId,
  validateReportBody,
  async (req, res) => {
    const report = await updateReport(
      req.params.reportId,
      res.locals.reportAuthorId,
      res.locals.reportInput,
    );

    // Another author's report also produces no matching record.
    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }

    res.json({ report });
  },
);

router.delete(
  "/reports/:reportId",
  requireReportUser,
  requireReportId,
  async (req, res) => {
    const deleted = await deleteReport(
      req.params.reportId,
      res.locals.reportAuthorId,
    );

    if (!deleted) {
      return res.status(404).json({ error: "Report not found." });
    }

    res.status(204).end();
  },
);

export default router;
