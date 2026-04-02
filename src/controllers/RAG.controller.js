import { embedder } from "../utils/RAG/embedding/embedder.js";
import { supabase } from "../config/supabaseClient.js";

export const askQuestion = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        status: 400,
        message: "Please provide a query for the model",
        error: "No query found",
        data: null,
      });
    }

    const questionEmbedding = await embedder(question);

    if (!questionEmbedding) {
      return res.status(400).json({
        status: 400,
        message: "Couldn't embed your question",
        error: "Embedding failed",
        data: null,
      });
    }

    const { data, error } = await supabase
      .from("chunk")
      .select("*")
      .order("embedding", { ascending: false, using: "cosine_distance", vector: questionEmbedding })
      .limit(10);

    if (error) {
      return res.status(400).json({
        status: 400,
        message: "There was an error parsing your request",
        error: "Embedding error",
        data: null,
      });
    }

    if (!data || !data.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "Your query did not match any records",
        error: "No relevant context found in database",
        data: null,
      });
    }

    const context = data.map((chunk) => `[${chunk.title}] - (${chunk.url})\n${chunk.content}`).join("\n\n");

    return res.status(200).json({
      status: 200,
      message: "Context generated from question embeddings",
      error: null,
      data: context,
    });

    //TODO:
    /* 
    const response = await generateAnswer({
    question: userQuestion,
    context
    });
    */
  } catch (error) {
    next(error);
  }
};
