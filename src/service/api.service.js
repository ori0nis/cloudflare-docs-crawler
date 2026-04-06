import { processCrawlRecords } from "@/utils/cheerio/processCrawlRecords";
import { applyChunkingToRecords } from "@/utils/RAG/chunking/applyChunkingToRecords";

export const accessCrawlData = async (accountId, jobId, apiToken) => {
  // Response
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/crawl/${jobId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    },
  );

  // Successful response check
  if (!response.ok) {
    return {
      status: "Failed",
      success: false,
      data: null,
      error: "Cloudflare request failed",
    };
  }

  const data = await response.json();
  const status = data.result.status;
  const records = data.result.records;
  const totalRecords = data.result.total;
  const finishedRecords = data.result.finished;
  const skippedRecords = data.result.skipped;

  // Success check
  if (!data.success) {
    return {
      status: status,
      success: false,
      totalRecords: totalRecords ?? 0,
      finishedRecords: finishedRecords ?? 0,
      skippedRecords: skippedRecords ?? 0,
      data: null,
      error: "Cloudflare request failed",
    };
  }

  // Status check
  switch (status) {
    case "completed":
      // Cheerio and chunking processing. Do only in completed case for efficiency
      const textContent = processCrawlRecords(records);
      const chunkedRecords = applyChunkingToRecords(textContent);

      return {
        status: status,
        success: true,
        job: {
          id: jobId,
          totalRecords: totalRecords ?? 0,
          finishedRecords: finishedRecords ?? 0,
          skippedRecords: skippedRecords ?? 0,
        },
        chunks: chunkedRecords,
        error: null,
      };
    case "running":
      return {
        status: status,
        success: false,
        job: null,
        chunks: null,
        error: null,
      };
    case "cancelled_due_to_timeout":
      return {
        status: status,
        success: false,
        job: null,
        chunks: null,
        error: "Cancelled due to timeout",
      };
    case "cancelled_due_to_limits":
      return {
        status: status,
        success: false,
        job: null,
        chunks: null,
        error: "Cancelled due to limits",
      };
    case "cancelled_by_user":
      return {
        status: status,
        success: false,
        job: null,
        chunks: null,
        error: "Cancelled by the user",
      };
    case "errored":
      return {
        status: status,
        success: false,
        job: null,
        chunks: null,
        error: "Crawl encountered an error",
      };
    default:
      return {
        status: status,
        success: false,
        job: null,
        chunks: null,
        error: "Unknown error",
      };
  }
};

export const startCrawlingJob = async (accountId, apiToken, url) => {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/crawl`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: url }),
  });

  if (!response.ok) {
    const errorDetail = await response.text();
    console.error("Cloudflare returned an error: ", errorDetail);
    
    return {
      success: false,
      jobId: null,
      error: "Cloudflare request failed",
    };
  }

  const jobId = await response.json();

  return {
    success: jobId.success,
    jobId: jobId.success ? jobId.result : null,
    error: jobId.success ? null : jobId.errors,
  };
};
