import express from "express";
import dotenv from "dotenv";
import { APIRouter } from "./routes/API.routes.js";
import { RAGRouter } from "./routes/RAG.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase connection
trySupabaseConnection();

// Global log for all requests
app.use((req, res, next) => {
  console.log(
    "🌩️  New request: ",
    "⚙️  Method: ",
    req.method,
    "🛣️  Path: ",
    req.path,
    "🧠  Headers: ",
    req.headers["content-type"],
  );
  next();
});

// JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router + home route
const router = express.Router();
router.get("/", (req, res, next) => {
  res.send("🕵️‍♀️ Welcome to the Cloudflare Docs Crawler!");
});
app.use("/", router);

// Rest of routes
app.use("/app", APIRouter);
app.use("/RAG", RAGRouter);

// Not found route avoider
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

// Express error handler
app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || "Unexpected error";
  return res.status(status).json({ message });
});

// Server
app.listen(PORT, () => {
  console.log(`💡 Server running on http://localhost:${PORT}`);
});
