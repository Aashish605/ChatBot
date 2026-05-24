import { supabase } from "./supabase";
import { TableDataProps } from "types/table";

export async function updateKnowledgeBaseRow(
  id: number,
  updatedData: Partial<TableDataProps>,
) {
  const { data, error } = await supabase
    .from("knowledge_base")
    .update(updatedData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.log("Error updating row", error);
    throw error;
  }
  return data;
}

export async function deleteKnowledgeBaseRow(id: number) {
  const { error } = await supabase
    .from("knowledge_base")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting row", error);
    throw error;
  }
}