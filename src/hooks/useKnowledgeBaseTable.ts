import { useState, useEffect, useMemo } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { getKnowledgeBaseData } from "data/react-table";
import {
  updateKnowledgeBaseRow,
  deleteKnowledgeBaseRow,
  swapRowPriorities,
} from "api/knowledgeBaseApi";
import { useTableToast } from "components/third-party/react-table/useTableToast";
import {
  inputToArray,
  normalizeSteps,
} from "utils/knowledgeBaseTransform";
import { TableDataProps } from "types/table";

export function useKnowledgeBase() {
  const [data, setData] = useState<TableDataProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const { toast, showToast, handleToastClose } = useTableToast();

  // ── Load data ──────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const result = await getKnowledgeBaseData();
        const sorted = [...result].sort((a, b) => a.priority - b.priority);
        setData(sorted);
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Derived data ───────────────────────────────────────────
  const categories = useMemo(
    () => [...new Set(data.map((row) => row.category))].sort(),
    [data],
  );

  const filteredData = useMemo(() => {
    const filtered = categoryFilter
      ? data.filter((row) => row.category === categoryFilter)
      : data;
    return [...filtered].sort((a, b) => a.priority - b.priority);
  }, [categoryFilter, data]);

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => filteredData.map((row) => String(row.id)),
    [filteredData],
  );

  // ── Delete ─────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (deleteTarget === null) return;
    try {
      await deleteKnowledgeBaseRow(deleteTarget);
      setData((prev) => prev.filter((item) => item.id !== deleteTarget));
      showToast("Row deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete row", err);
      showToast("Failed to delete row", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Save / Edit ────────────────────────────────────────────
  const handleSave = async (
    rowId: number,
    updatedData: Record<string, unknown>,
  ) => {
    try {
      const payload: Partial<TableDataProps> = {
        title: String(updatedData.title || ""),
        type: String(updatedData.type || ""),
        category: String(updatedData.category || ""),
        question: String(updatedData.question || ""),
        answer: String(updatedData.answer || ""),
        content: String(updatedData.content || ""),
        priority: Number(updatedData.priority),
        is_active:
          updatedData.is_active === true || updatedData.is_active === "true",
        visibility: updatedData.visibility as "public" | "private",
        tags: inputToArray(String(updatedData.tags || "")),
        keywords: inputToArray(String(updatedData.keywords || "")),
        common_user_phrases: inputToArray(
          String(updatedData.common_user_phrases || ""),
        ),
        steps: normalizeSteps(updatedData.steps),
      };

      const cleanedPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== undefined),
      );

      console.log("Row id being updated:", rowId);
      console.log("Clean payload:", JSON.stringify(cleanedPayload, null, 2));

      const savedRow = await updateKnowledgeBaseRow(rowId, cleanedPayload);

      setData((prev) =>
        prev.map((item) => (item.id === rowId ? savedRow : item)),
      );
      showToast("Row updated successfully", "success");
    } catch (err: any) {
      console.error("Failed to update row:", err);
      console.error("Error code:", err?.code);
      console.error("Error message:", err?.message);
      showToast("Failed to update row", "error");
    }
  };

  // ── Swap priority ──────────────────────────────────────────
  const handleSwapPriority = async (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
  ) => {
    const rowA = data.find((row) => String(row.id) === String(activeId));
    const rowB = data.find((row) => String(row.id) === String(overId));

    if (!rowA || !rowB) {
      console.error("Could not find rows to swap", { activeId, overId });
      return;
    }

    const updated = data.map((row) => {
      if (row.id === rowA.id) return { ...row, priority: rowB.priority };
      if (row.id === rowB.id) return { ...row, priority: rowA.priority };
      return row;
    });

    setData(updated);

    try {
      await swapRowPriorities(
        rowA.id, rowA.priority,
        rowB.id, rowB.priority,
      );
      showToast("Priority swapped successfully", "success");
    } catch (err) {
      console.error("Failed to swap priorities", err);
      showToast("Failed to swap priorities", "error");
      setData(data); // rollback
    }
  };

  return {
    data,
    loading,
    filteredData,
    dataIds,
    categories,
    categoryFilter,
    setCategoryFilter,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    handleSave,
    handleSwapPriority,
    toast,
    handleToastClose,
  };
}