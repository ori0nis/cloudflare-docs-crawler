import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req) {
  try {
    const { userQuery } = await req.json();

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!userQuery || typeof userQuery !== "string") {
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

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/embed-user-query`;

    const queryEmbedding = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: userQuery }),
    });

    if (queryEmbedding.ok) {
      console.log("⚡ Query successfully embedded in database");
    } else {
      console.log("❌ Couldn't embed user query");
    }

    const completion = await queryEmbedding.json();
    const queryEmbedded = completion.data;

    if (!queryEmbedded || queryEmbedded.length === 0) {
      console.log("⚠️ Couldn't find relevant context. Groq call aborted");

      return NextResponse.json(
        {
          status: 200,
          message: "I couldn't find specific information in the documentation to answer your question.",
          data: "Sorry, my database doesn't contain relevant details regarding your query.",
        },
        { status: 200 },
      );
    }

    const context = queryEmbedded
      .map((chunk) => `Document title: ${chunk.title} - URL: ${chunk.url} - Content: ${chunk.content}`)
      .join("\n\n---\n\n");

    console.log(`🔍 Context returned: ${queryEmbedded?.length || 0} chunks found.`);

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are an expert in coding documentation. User is going to send you a query regarding a specific documentation and you have to respond using only this documentation context. If the answer isn't in that context, don't hallucinate. Kindly say you don't have a response. Also, always cite the URL you got your response from:\n" +
              context,
          },
          { role: "user", content: userQuery },
        ],
      }),
    });

    const groqAnswer = await groqResponse.json();

    if (!groqResponse.ok) {
      console.log("❌ Groq couldn't process user query: ", groqAnswer);
      return NextResponse.json(
        { error: "Groq failed", details: groqAnswer.error?.message || "Unknown error" },
        { status: groqResponse.status },
      );
    }

    if (!groqAnswer.choices || groqAnswer.choices.length === 0) {
      console.log("❌ Groq returned an empty completion: ", groqAnswer);
      return NextResponse.json({ error: "Answer with no completion" }, { status: 500 });
    }

    return NextResponse.json(
      {
        status: 200,
        message: "Context generated from question embeddings",
        error: null,
        data: groqAnswer.choices[0].message.content,
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
