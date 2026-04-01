import { supabase } from "./supabaseClient.js";

export const trySupabaseConnection = async () => {
  const { error } = await supabase.from("chunk").select("id").limit(1);

  if (error) {
    console.error(`❌ Supabase connection failed: ${error.message}`);
  } else {
    console.log("⚡ Successfully connected to Supabase Vector DB");
  }
};
