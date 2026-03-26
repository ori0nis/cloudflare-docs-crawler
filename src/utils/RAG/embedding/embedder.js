import { Ollama } from "ollama";

const ollama = new Ollama();

export const embedder = async (text) => {
  const response = await ollama.embeddings({
    model: "llama3-embeddings",
    input: text,
  });

  return response.vector;
};
