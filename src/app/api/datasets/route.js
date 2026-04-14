import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = supabase.from("datasets").select("url_base").eq("status", "completed");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ datasets: data });
}
