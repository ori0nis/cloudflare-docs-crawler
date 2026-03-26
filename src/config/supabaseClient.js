import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseURL || !supabaseKey) throw new Error("Supabase .env variables missing");

export const supabase = createClient(supabaseURL, supabaseKey);
