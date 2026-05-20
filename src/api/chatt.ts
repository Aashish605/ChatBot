import { createEmbedding } from "./embeddings";

import { searchKnowledge } from "./rag";

import { openai } from "./openai";

import { supabase } from "./supabase";

export async function sendChatMessage({
  sessionId,
  question,
}: {
  sessionId: string;
  question: string;
}) {
  // 1. Create embedding
  const embedding = await createEmbedding(question);

  // 2. Retrieve knowledge
  const knowledge = await searchKnowledge(embedding);

  // 3. Build context
  const context = knowledge
    .map((doc: any) => {
      return `
Title:
${doc.title}

Content:
${doc.content}
`;
    })
    .join("\n\n");

  // 4. Generate AI response
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",

    messages: [
      {
        role: "system",
        content: `
You are AI support assistant.

Answer ONLY from provided knowledge.
`,
      },

      {
        role: "user",
        content: `
Knowledge:
${context}

Question:
${question}
`,
      },
    ],
  });

  const aiResponse = completion.choices[0].message.content;

  // 5. Save user message
  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    sender_type: "user",
    message: question,
  });

  // 6. Save AI response
  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    sender_type: "ai",
    message: aiResponse,
  });

  return aiResponse;
}


