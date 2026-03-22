import express from "express";
import { crawlSite, getCrawlData } from "../controllers/api.controller.js";

export const appRouter = express.Router();

appRouter.post("/sites", crawlSite);
appRouter.get("/sites/:jobId/results", getCrawlData);
