import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { client } from "./db/connection.js";
import session from "express-session";
import passport from "./auth/passport.js";
import MongoSessionStore, {
  ensureSessionIndexes,
} from "./auth/MongoSessionStore.js";
import { ensureUserIndexes } from "./db/users.js";
import authRouter from "./routes/auth.js";
import restaurantsRouter from "./routes/restaurants.js";
import reportsRouter from "./routes/reports.js";
import recallsRouter from "./routes/recalls.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.join(__dirname, "../frontend/dist");

app.use(express.json());

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error(
    "Run node scripts/configureSession.js in backend to configure SESSION_SECRET.",
  );
}

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(
  "/api",
  session({
    name: "safebite.sid",
    secret: sessionSecret,
    store: new MongoSessionStore(),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);
app.use("/api", passport.initialize(), passport.session());
app.use("/api/auth", authRouter);

app.use("/api/recalls", recallsRouter);
app.use("/api/restaurants", restaurantsRouter);
app.use("/api", reportsRouter);

// Register additional API routers above this fallback.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found." });
});

app.use(express.static(frontendDirectory));

app.use((req, res) => {
  res.sendFile(path.join(frontendDirectory, "index.html"));
});

// Express recognizes error middleware by its four parameters.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const errorStatus = error.status ?? error.statusCode;
  const status =
    Number.isInteger(errorStatus) && errorStatus >= 400 && errorStatus <= 599
      ? errorStatus
      : 500;

  if (status >= 500) {
    console.error("Request failed:", error.message);
  }

  let message = "Could not complete the request.";

  if (status === 400) {
    message = "Invalid request.";
  } else if (status === 413) {
    message = "Request body is too large.";
  }

  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 3000;

try {
  // Connect the shared MongoDB client before accepting requests.
  await client.connect();
  await ensureUserIndexes();
  await ensureSessionIndexes();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("Backend startup failed:", error.message);
  await client.close();
  process.exitCode = 1;
}
