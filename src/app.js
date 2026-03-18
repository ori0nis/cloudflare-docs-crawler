import express from "express";
import dotenv from "dotenv";
import { appRouter } from "./routes/app.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use("/app", appRouter);

// Not found route avoider
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

// Express error controller
app.use((error, req, res, next) => {
  return res.status(error.status || 500).json(error.message || "Unexpected error");
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Global log for all requests
app.use((req, res, next) => {
  console.log("New request: ", req.method, req.path, req.headers["content-type"]);
  next();
});
