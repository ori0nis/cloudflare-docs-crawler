import { chunker } from "./chunker.js";

export const applyChunkingToRecords = (records) => {
  return records
    .filter((record) => record.hasContent)
    .map((record) => {
      const chunks = chunker(record.content);

      return chunks.map((chunk) => ({
        ...chunk,
        url: record.url,
        title: record.title,
      }));
    })
    .flat();
};
