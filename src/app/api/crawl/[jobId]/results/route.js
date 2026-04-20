import { NextResponse } from "next/server";
import { accessCrawlData } from "@/service/api.service";
import { supabase } from "@/config/supabaseClient";

//? GET (access crawl data using the jobId)
export async function GET(req, { params }) {
  try {
    const { jobId } = await params;

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
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
    console.log(`Cloudflare crawling for ${jobId} status: ${result.status}`);

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
      const chunks = result.chunks;
      const crawlData = result.job;
      const batchSize = 4;
      let successfulBatches = 0;

      let hostname = null;
      if (crawlData?.url) {
        try {
          hostname = new URL(crawlData.url).hostname;
        } catch (error) {
          console.error("Cloudflare returned a bad URL: ", crawlData.url);
        }
      }

      if (!hostname) {
        return NextResponse.json(
          {
            status: "error",
            message: "Couldn't determine hostname to update Supabase",
          },
          { status: 500 },
        );
      }

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

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Edge Function error:", errorText);
            throw new Error(`Edge Function failed: ${response.status}`);
          } else {
            successfulBatches++;
          }
        } catch (error) {
          console.error("Error calling Edge Function:", error.message);
          return NextResponse.json(
            {
              status: "error",
              error: error.message,
            },
            { status: 500 },
          );
        }
      }

      await supabase.from("datasets").update({ status: "completed" }).eq("url_base", hostname);

      return NextResponse.json(
        {
          status: "completed",
          message: "Ingestion finished successfully",
          data: {
            job: crawlData,
            chunks,
            totalChunks: chunks.length,
            batchesProcessed: successfulBatches,
            hostname: hostname,
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
