import { supabase } from "./supabase"

export async function searchKnowledge(
  embedding: number[]
) {
  const { data, error } =
    await supabase.rpc(
      "match_knowledge",
      {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: 5
      }
    );

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}