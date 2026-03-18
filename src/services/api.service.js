import dotenv from "dotenv";

dotenv.config();

export const accessCrawlData = async (jobId) => {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/crawl/${jobId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    },
  );

  const data = await response.json();
  return { data: data.result };
};

export const startCrawlingJob = async (accountId, apiToken, url = "https://developers.cloudflare.com/workers/") => {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/crawl`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: `${url}`,
    }),
  });

  const jobId = await response.json();

  if (jobId.success) {
    return { jobId: jobId.result };
  } else {
    return {
      success: jobId.success,
      jobId: jobId.success ? jobId.result : null,
      errors: jobId.success ? null : jobId.errors,
    };
  }
};
