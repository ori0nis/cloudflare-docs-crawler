import express from "express";
import dotenv from "dotenv";
import { appRouter } from "./routes/app.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use("/app", appRouter);

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
