import { supabase } from "../../../config/supabaseClient";

export const saveVectorToDB = async (vector, metadata) => {
  const { data, error } = await supabase.from("embeddings").insert([{ vector, ...metadata }]);

  if (error) throw error;

  return data;
};
