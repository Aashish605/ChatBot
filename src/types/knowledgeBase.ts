export interface KnowledgeBaseStep {
  text: string;
}

export interface KnowledgeBaseFormData {
  type: string;
  title: string;
  question: string;
  answer: string;
  content: string;
  category: string;
  tags: string;
  keywords: string;
  common_user_phrases: string;
  steps: KnowledgeBaseStep[];
  priority: number;
  visibility: "public" | "private";
  is_active: boolean;
}