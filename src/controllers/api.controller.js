import { ingestChunks } from "../ingestion-service/ingestChunks.js";
import { accessCrawlData, startCrawlingJob } from "../services/api.service.js";
import dotenv from "dotenv";

dotenv.config();

// POST (site gets crawled, returns a jobId)
export const crawlSite = async (req, res, next) => {
  try {
    const { url } = req.body;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const regex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;

    if (!url || !url.match(regex)) {
      return res.status(400).json({
        status: 400,
        message: "Provide a valid URL",
        error: "Invalid URL",
        data: null,
      });
    }

    if (!accountId || !apiToken) {
      return res.status(400).json({
        status: 400,
        message: "Provide valid credentials",
        error: "Invalid credentials",
        data: null,
      });
    }

    const result = await startCrawlingJob(accountId, apiToken, url);

    if (result.success) {
      return res.status(200).json({
        status: 200,
        message: "JobId successfully created",
        error: null,
        data: result.jobId,
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Couldn't crawl site",
        error: result.error,
        data: null,
      });
    }
  } catch (error) {
    next(error);
  }
};

// GET (access crawl data using the jobId)
export const getCrawlData = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!jobId) {
      return res.status(400).json({
        status: 400,
        message: "Please provide a jobId",
        error: "Invalid jobId",
        data: null,
      });
    }

    const result = await accessCrawlData(accountId, jobId, apiToken);
    const crawlData = result.job;
    const chunks = result.chunks;

    if (result.success) {
      // Ingestion runs in background so API doesn't get blocked
      ingestChunks(chunks)
        .then((summary) => console.log("Ingestion finished: ", summary))
        .catch((error) => console.error("Ingestion failed: ", error));

      return res.status(200).json({
        status: 200,
        message: "Crawl data provided - ingestion running in background",
        error: null,
        data: {
          job: crawlData,
          chunks,
        },
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Couldn't provide crawl data",
        error: result.error,
        data: null,
      });
    }
  } catch (error) {
    next(error);
  }
};
