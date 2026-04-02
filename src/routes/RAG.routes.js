import express from "express";
import { askQuestion } from "../controllers/RAG.controller.js";

export const RAGRouter = express.Router();

RAGRouter.post("/ask", askQuestion);
