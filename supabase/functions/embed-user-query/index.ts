import { createClient } from "supabase";

declare const Supabase: any;

//? embed-user-query edge function

Deno.serve(async (req) => {
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const session = new Supabase.ai.Session("gte-small");

    const { query, dataset } = await req.json();

    console.log(`User sent query ${query}`);

    const queryVector = await session.run(query, {
      mean_pool: true,
      normalize: true,
    });

    const { data: queryChunks, error } = await supabase.rpc("match_chunks", {
      query_embedding: queryVector,
      match_threshold: 0.2,
      match_count: 10,
      filter_dataset: dataset,
    });

    if (error) {
      return Response.json(
        {
          status: 400,
          message: "There was an error parsing your request",
          error: "Embedding error",
          data: null,
        },
        { status: 400 },
      );
    }

    if (!queryChunks || queryChunks.length === 0) {
      return Response.json(
        {
          status: 200,
          message: "Your query did not match any records",
          error: "No relevant context found in database",
          data: null,
        },
        { status: 200 },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Query embedded in database",
        data: queryChunks,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: any) {
    console.error("🚨 FATAL ERROR: ", error.message);

    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
});
