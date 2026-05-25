import { useState } from "react";

import { saveKnowledgeBase } from "api/knowledgeBase";

import { KnowledgeBaseFormData } from "types/knowledgeBase";


export function useKnowledgeBase() {
  const [loading, setLoading] = useState(false);

  const submitKnowledgeBase = async (data: KnowledgeBaseFormData) => {
    try {
      setLoading(true);

      await saveKnowledgeBase(data);

      return true;
    } catch (error) {
      console.error("Failed to save knowledge base:", error);

      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitKnowledgeBase,
  };
}


