import { cheerioProcessor } from "./cheerioProcessor.js";

export const processCrawlRecords = (records) => {
  return records.map((record) => ({
    url: record.url,
    title: record.metadata.title || "Crawled page",
    content: cheerioProcessor(record.html),
  }));
};
