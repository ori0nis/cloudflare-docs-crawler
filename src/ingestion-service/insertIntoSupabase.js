import { supabase } from "../config/supabaseClient.js";

export const insertIntoSupabase = async (embedding, metadata) => {
  if (!metadata) {
    console.error("Metadata is undefined");
    return;
  }

  const props = ["title", "url", "content", "dataset", "embedding"];
  const hasAllProps = props.every((prop) => metadata.hasOwnProperty(prop));

  if (!hasAllProps) {
    console.error("Metadata missing required props");
    return;
  }

  const { data, error } = await supabase
    .from("chunk")
    .insert([{ embedding, ...metadata }])
    .select();

  if (error) console.error("Error inserting chunk: ", error);

  return data;
};
