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
    const crawl = result.data;

    if (result.success) {
      return res.status(200).json({
        status: 200,
        message: "Crawl data provided",
        error: null,
        data: {
          id: crawl.id,
          totalRecords: crawl.totalRecords ?? 0,
          finishedRecords: crawl.finishedRecords ?? 0,
          skippedRecords: crawl.skippedRecords ?? 0,
          result: crawl,
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
