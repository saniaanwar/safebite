import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { client } from "./db/connection.js";
import restaurantsRouter from "./routes/restaurants.js";
import reportsRouter from "./routes/reports.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.join(__dirname, "../frontend/dist");

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend works" });
});

// Mount shared session and Passport middleware before these routers.
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

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("Backend startup failed:", error.message);
  await client.close();
  process.exitCode = 1;
}
