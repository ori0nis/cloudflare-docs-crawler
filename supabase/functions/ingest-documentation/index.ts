import { createClient } from "supabase";

declare const Supabase: any;

//? ingest-documentation edge function

Deno.serve(async (req) => {
  try {
    const { chunks } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    const session = new Supabase.ai.Session("gte-small");

    console.log(`Received ${chunks.length} to process`);

    for (const chunk of chunks) {
      try {
        const { data: existing, error: checkError } = await supabase
          .from("chunk")
          .select("id")
          .eq("url", chunk.url)
          .eq("content", chunk.content)
          .maybeSingle();

        if (checkError) throw new Error(`Check failed: ${checkError.message}`);

        if (existing) {
          console.log(`Skipping chunk - already in database`);
          continue;
        }

        const embedding = await session.run(chunk.content, {
          mean_pool: true,
          normalize: true,
        });

        const { error } = await supabase.from("chunk").insert({
          title: chunk.title,
          url: chunk.url,
          content: chunk.content,
          dataset: chunk.dataset,
          embedding: Array.from(embedding),
        });

        if (error) console.error("Error inserting chunk: ", error.message);
      } catch (error: any) {
        console.error("Error processing chunk: ", error.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Ingestion completed",
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
