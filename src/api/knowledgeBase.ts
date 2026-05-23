import { supabase } from "./supabase";
import { KnowledgeBaseFormData } from "types/knowledgeBase";
import { getuserID } from "./chatt";


export async function saveKnowledgeBase(formData: KnowledgeBaseFormData) {
  try {
    console.log(formData)
    if (!formData.title) throw new Error("Title is required");

    const textToEmbed = `
Title: ${formData.title}
Question: ${formData.question || ""}
Answer: ${formData.answer || ""}
Content: ${formData.content || ""}
Category: ${formData.category || ""}
Keywords: ${formData.keywords || ""}
Tags: ${formData.tags || ""}
User Phrases: ${formData.common_user_phrases || ""}
`;

    const { data: functionData, error: functionError } = await supabase.functions.invoke("generate-embedding", {
      body: { text: textToEmbed },
    });

    if (functionError || !functionData || !functionData.embedding) {
      throw new Error(functionError?.message || "Embedding failed");
    }

    const embedding = functionData.embedding;


    const { data, error } = await supabase
      .from("knowledge_base")
      .insert({
        type: formData.type,
        title: formData.title,
        question: formData.question,
        answer: formData.answer,
        content: formData.content,
        category: formData.category,
        tags: formData.tags
          ? formData.tags.split(",").map(t => t.trim()).filter(Boolean)
          : [],

        keywords: formData.keywords
          ? formData.keywords.split(",").map(k => k.trim()).filter(Boolean)
          : [],

        common_user_phrases: formData.common_user_phrases
          ? formData.common_user_phrases.split(",").map(p => p.trim()).filter(Boolean)
          : [],

        priority: Number(formData.priority),
        visibility: formData.visibility,
        is_active: formData.is_active,
        embedding,
        created_by:getuserID(),
        steps:formData.steps,
      })
      .select();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("Upload Error:", err);
    throw err;
  }
}