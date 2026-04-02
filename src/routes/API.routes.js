import express from "express";
import { crawlSite, getCrawlData } from "../controllers/api.controller.js";

export const APIRouter = express.Router();

APIRouter.post("/sites", crawlSite);
APIRouter.get("/sites/:jobId/results", getCrawlData);
