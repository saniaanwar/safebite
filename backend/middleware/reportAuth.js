import { ObjectId } from "mongodb";

// Normalize the Passport user's ID for report ownership.
export function getReportAuthorId(req) {
  if (
    typeof req.isAuthenticated !== "function" ||
    req.isAuthenticated() !== true
  ) {
    return null;
  }

  const userId = req.user?._id ?? req.user?.id;

  if (userId instanceof ObjectId) {
    return userId.toHexString();
  }

  if (typeof userId === "string" && userId.trim().length > 0) {
    return userId.trim();
  }

  throw new Error("Authenticated user is missing a usable report author ID.");
}

// Require a signed-in user before report writes.
export function requireReportUser(req, res, next) {
  const authorId = getReportAuthorId(req);

  if (!authorId) {
    return res.status(401).json({
      error: "Log in to create, edit, or delete community reports.",
    });
  }

  res.locals.reportAuthorId = authorId;
  return next();
}
