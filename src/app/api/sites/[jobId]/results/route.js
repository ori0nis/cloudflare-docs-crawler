import { NextResponse } from "next/server";
import { accessCrawlData } from "@/service/api.service";
import { ingestChunks } from "@/ingestion-service/ingestChunks";

// GET (access crawl data using the jobId)
export async function GET(req, { params }) {
  try {
    const { jobId } = params;

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!jobId) {
      return NextResponse.json(
        {
          status: 400,
          message: "Please provide a jobId",
          error: "Invalid jobId",
        },
        { status: 400 },
      );
    }

    const result = await accessCrawlData(accountId, jobId, apiToken);

    if (result.success) {
      const crawlData = result.job;
      const chunks = result.chunks;

      // Ingestion runs in background so API doesn't get blocked
      // TODO: Check for Vercel timeouts
      ingestChunks(chunks)
        .then((summary) => console.log("Ingestion finished: ", summary))
        .catch((error) => console.error("Ingestion failed: ", error));

      return NextResponse.json(
        {
          status: 200,
          message: "Crawl data provided - ingestion running in background",
          data: {
            job: crawlData,
            chunks,
          },
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        {
          status: 400,
          message: "Couldn't provide crawl data",
          error: result.error,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
