import Tab from "themes/overrides/Tab";
import { supabase } from "../api/supabase";

import { TableDataProps } from "types/table";

export async function getKnowledgeBaseData(): Promise<TableDataProps[]> {
  const { data, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .order("id", { ascending: true });
  if (error) {
    console.error("Error fetching knowledge base:", error);
    throw error;
  }
  return data ?? [];
}

