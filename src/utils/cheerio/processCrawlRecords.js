import { cheerioProcessor } from "./cheerioProcessor.js";

export const processCrawlRecords = (records) => {
  return records
    .filter((record) => record && record.html)
    .map((record) => {
      const html = record.html;

      const base = {
        url: record.url,
        title: record.metadata.title || "Crawled page",
        dataset: new URL(record.url).hostname,
      };

      const processed = cheerioProcessor(html);
      const cleaned = processed.trim();

      if (cleaned === "") {
        return {
          ...base,
          hasContent: false,
          content: null,
        };
      } else {
        return {
          ...base,
          hasContent: true,
          content: processed,
        };
      }
    });
};
