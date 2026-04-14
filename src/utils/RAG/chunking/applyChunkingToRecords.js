import { chunker } from "./chunker.js";

export const applyChunkingToRecords = (records) => {
  return records
    .filter((record) => record.hasContent)
    .flatMap((record) => {
      const chunks = chunker(record.content);

      return chunks.map((chunk) => ({
        ...chunk, // index + content
        url: record.url,
        title: record.title,
        dataset: record.dataset,
      }));
    });
};
