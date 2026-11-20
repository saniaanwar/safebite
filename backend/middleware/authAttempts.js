const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 30; // I feel like this is a lot of attempts (then again we didn't even think to limit this in our project, so good job)

// Bound repeated password attempts for this single-server course application.
export function limitAuthAttempts(req, res, next) {
  const now = Date.now();
  for (const [key, value] of attempts) {
    if (value.resetAt <= now) attempts.delete(key);
  }

  const key = req.ip;
  const entry = attempts.get(key) ?? { count: 0, resetAt: now + WINDOW_MS };
  entry.count += 1;
  if (!attempts.has(key) && attempts.size >= 10000)
    attempts.delete(attempts.keys().next().value);
  attempts.set(key, entry);

  if (entry.count > MAX_ATTEMPTS) {
    res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
    return res
      .status(429)
      .json({ error: "Too many sign-in attempts. Please try again later." });
  }
  return next();
}
