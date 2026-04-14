import { NextResponse } from "next/server";
import { startCrawlingJob } from "@/service/api.service";
import { createClient } from "@supabase/supabase-js";

//? POST (site gets crawled, returns a jobId)
export async function POST(req) {
  try {
    const { url } = await req.json();

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const regex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;

    // Testing for good query
    if (!url || !url.match(regex)) {
      return NextResponse.json(
        {
          status: 400,
          message: "Provide a valid URL",
          error: "Invalid URL",
          data: null,
        },
        { status: 400 },
      );
    }

    if (!accountId || !apiToken) {
      return NextResponse.json(
        {
          status: 400,
          message: "Provide valid credentials",
          error: "Invalid credentials",
          data: null,
        },
        { status: 400 },
      );
    }

    // Testing if crawling already exists
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const hostname = new URL(url).hostname;

    const { data: dataset } = await supabase.from("datasets").select("status").eq("url_base", hostname).maybeSingle();

    if (dataset?.status === "completed") {
      return NextResponse.json(
        {
          status: 200,
          alreadyExists: true,
          message: "Documentation already exists in database",
        },
        { status: 200 },
      );
    }

    if (!dataset) {
      await supabase
        .from("datasets")
        .upsert({ url_base: hostname, status: "processing", last_ingested_at: new Date().toISOString() });
    }

    // Calling Cloudflare
    const result = await startCrawlingJob(accountId, apiToken, url);

    if (result.success) {
      return NextResponse.json(
        {
          status: 200,
          message: "JobId successfully created",
          error: null,
          data: result.jobId,
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        {
          status: 400,
          message: "Couldn't crawl site",
          error: result.error,
          data: null,
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
