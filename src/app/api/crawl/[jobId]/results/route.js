import { NextResponse } from "next/server";
import { accessCrawlData } from "@/service/api.service";

//? GET (access crawl data using the jobId)
export async function GET(req, { params }) {
  try {
    const { jobId } = await params;

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    if (result.status === "running") {
      return NextResponse.json(
        {
          status: "running",
          message: "Cloudflare is still crawling...",
        },
        { status: 200 },
      );
    }

    if (result.success && result.status === "completed") {
      const crawlData = result.job;
      const chunks = result.chunks;
      const batchSize = 4;
      const resultsSummary = { successful: 0, failed: 0 };

      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/ingest-documentation`;

      console.log(`Processing ${chunks.length} in batches of ${batchSize}`);

      // Ingestion runs in background and in batches so API doesn't get blocked
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);

        try {
          const response = await fetch(edgeFunctionUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({ chunks: batch }),
          });

          if (response.ok) {
            resultsSummary.successful++;
            console.log(`⚡ Batch ${resultsSummary.successful} sent`);
          } else {
            resultsSummary.failed++;
            const text = await response.text();
            console.log(`❌ Batch error: ${text}`);
          }
        } catch (error) {
          console.error("❌ Batching returned fatal error: ", error.message);
        }
      }

      return NextResponse.json(
        {
          status: 200,
          message: "Crawl data provided - ingestion running in background",
          data: {
            job: crawlData,
            chunks,
            totalChunks: chunks.length,
            batchesProcessed: resultsSummary.successful,
            batchesFailed: resultsSummary.failed,
          },
        },
        { status: 200 },
      );
    } else {
      if (!result.success) {
        console.error("❌ ERROR DETECTED");
        console.log("JOB ID:", jobId);
        console.log("Service response:", JSON.stringify(result, null, 2));
      }

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
