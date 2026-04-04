import { embedder } from "@/utils/RAG/embedding/embedder";
import { supabase } from "@/config/supabaseClient";
import { insertIntoSupabase } from "./insertIntoSupabase";

export const ingestChunks = async (chunkArray) => {
  let insertedChunks = 0;
  let skippedChunks = 0;
  let failedChunks = 0;

  for (let chunk of chunkArray) {
    const { data, error } = await supabase.from("chunk").select("id").eq("content", chunk.content).eq("url", chunk.url);

    if (error) {
      console.log("There was an error querying the database: ", error.message);
      failedChunks++;
      continue;
    }

    if (data.length > 0) {
      console.log("Chunk already exists in database");
      skippedChunks++;
      continue;
    }

    try {
      const vector = await embedder(chunk.content);
      const metadata = {
        title: chunk.title,
        url: chunk.url,
        content: chunk.content,
        dataset: chunk.dataset,
        embedding: vector,
      };

      await insertIntoSupabase(vector, metadata);

      insertedChunks++;
    } catch (error) {
      console.error(error?.message);
      failedChunks++;
    }
  }

  return {
    totalChunks: chunkArray.length,
    insertedChunks,
    failedChunks,
    skippedChunks,
  };
};
