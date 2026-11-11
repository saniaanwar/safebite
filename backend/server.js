import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { client } from "./db/connection.js";
import recallsRouter from "./routes/recalls.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.join(__dirname, "../frontend/dist");

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend works" });
});

app.use("/api/recalls", recallsRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found." });
});

app.use(express.static(frontendDirectory));

app.use((req, res) => {
  res.sendFile(path.join(frontendDirectory, "index.html"));
});

const PORT = process.env.PORT || 3000;

try {
  await client.connect();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("Backend startup failed:", error.message);
  await client.close();
  process.exitCode = 1;
}