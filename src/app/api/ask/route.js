import { NextResponse } from "next/server";
import { embedder } from "@/utils/RAG/embedding/embedder";
import { supabase } from "@/config/supabaseClient";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        {
          status: 400,
          message: "Please provide a query for the model",
          error: "No query found",
          data: null,
        },
        { status: 400 },
      );
    }

    const queryVector = await embedder(query);

    if (!queryVector) {
      return NextResponse.json(
        {
          status: 400,
          message: "Couldn't embed your question",
          error: "Embedding failed",
          data: null,
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.rpc("match_chunks", {
      query_embedding: queryVector,
      match_threshold: 0.5,
      match_count: 5,
    });

    if (error) {
      return NextResponse.json(
        {
          status: 400,
          message: "There was an error parsing your request",
          error: "Embedding error",
          data: null,
        },
        { status: 400 },
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          status: 200,
          message: "Your query did not match any records",
          error: "No relevant context found in database",
          data: null,
        },
        { status: 200 },
      );
    }

    const context = data.map((chunk) => chunk.content).join("\n\n---\n\n");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "Respond using only this documentation context:\n" + context },
          { role: "user", content: query },
        ],
      }),
    });

    const completion = await response.json();

    return NextResponse.json(
      {
        status: 200,
        message: "Context generated from question embeddings",
        error: null,
        data: completion.choices[0].message.content,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }
}
