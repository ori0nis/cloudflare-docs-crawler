//!
//!
//! THIS CODE HAS BEEN REPLACED BY THE DENO EDGE FUNCTION AND IS NOW DEPRECATED
//!
//!

import { pipeline } from "@xenova/transformers";

/*
 * This local embeddings service exposes a function called `embedder`,
 * which processes text into 768 dimensional vectors using
 * Hugging Face's `all-mpnet-base-v2`, and executing locally
 */

const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

export const embedder = async (text) => {
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
};
