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
    .select();

  if (error) {
    console.log("Error updating row", error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error(`Update failed: no row found with id=${id}`);
  }

  return data[0];
}

export async function deleteKnowledgeBaseRow(id: number) {
  const { error } = await supabase.from("knowledge_base").delete().eq("id", id);

  if (error) {
    console.error("Error deleting row", error);
    throw error;
  }
}

export async function swapRowPriorities(
  idA: number,
  priorityA: number,
  idB: number,
  priorityB: number,
) {
  const [resultA, resultB] = await Promise.all([
    supabase
      .from("knowledge_base")
      .update({ priority: priorityB })
      .eq("id", idA),
    supabase
      .from("knowledge_base")
      .update({ priority: priorityA })
      .eq("id", idB),
  ]);

  if (resultA.error) throw resultA.error;
  if (resultB.error) throw resultB.error;
}
