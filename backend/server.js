import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { client } from "./db/connection.js";
import restaurantsRouter from "./routes/restaurants.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.join(__dirname, "../frontend/dist");

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend works" });
});

app.use("/api/restaurants", restaurantsRouter);

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

  console.error("Request failed:", error.message);
  res.status(500).json({
    error: "Could not complete the request.",
  });
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
