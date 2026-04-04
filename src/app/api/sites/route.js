import { NextResponse } from "next/server";
import { startCrawlingJob } from "@/service/api.service";

// POST (site gets crawled, returns a jobId)
export async function POST(req) {
  try {
    const { url } = await req.json();

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const regex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;

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
