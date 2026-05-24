/* eslint-disable prettier/prettier */
import { openai } from "./openai";
import { supabase } from "./supabase";
import { useAuthStore } from "store/authStore";

// =========================
// USER ID
// =========================
export const getuserID = () => {
  const userID = useAuthStore.getState().user?.id;
  if (!userID) {
    console.error("No user found in the users table.");
    return null;
  }
  return userID;
};

// =========================
// USER NAME EXTRACTION
// =========================
export const checkUserNameFromMessage = async (
  message?: string,
  session_id?: string,
) => {
  if (!message || !session_id) return;

  console.log("extract name started" , message , session_id)

  const { data, error } = await supabase.functions.invoke("extract-name", {
    body: { message },
  });

  if (error || !data) return null;

  // Only update if a name was actually found
  if (data.name) {
    const { error: updateError } = await supabase
      .from("chat_sessions")
      .update({name: data.name })
      .eq("id", session_id);

    if (updateError) console.error("Failed to save user name:", updateError.message);
  }

  return data.name ?? null;
};

// =========================
// SESSION HANDLER (optimized)
// =========================
let sessionPromise: Promise<{ id: string; isNew: boolean }> | null = null;
let cachedSessionId: string | null = null;  // Avoid DB queries on every message
let nameCheckDone = false;                  // Run extraction only once per load

export const chatSession = async (message?: string) => {
  // Return cached session immediately — no DB round-trip, no new sessions
  if (cachedSessionId) {
    if (!nameCheckDone && message) {
      nameCheckDone = true; // Set BEFORE await to block concurrent calls
      await checkUserNameFromMessage(message, cachedSessionId);
    }
    return { id: cachedSessionId, isNew: false };
  }

  // Deduplicate concurrent in-flight requests
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    try {
      const user_id = getuserID();
      if (!user_id) throw new Error("No user id");

      const { data: existingSession } = await supabase
        .from("chat_sessions")
        .select("id, user_name_extracted")
        .eq("user_id", user_id)
        .eq("status", "open")
        .order("created_at", { ascending: false }) // created_at is always set; safer than last_message_at
        .limit(1)
        .maybeSingle();

      if (existingSession) {
        cachedSessionId = existingSession.id;
        // Mark done if already extracted; otherwise try on first real message
        if (existingSession.user_name_extracted) {
          nameCheckDone = true;
        } else if (message && !nameCheckDone) {
          nameCheckDone = true;
          await checkUserNameFromMessage(message, existingSession.id);
        }
        return { id: existingSession.id, isNew: false };
      }

      const { data: newSession } = await supabase
        .from("chat_sessions")
        .insert({ user_id, status: "open", source: "web" })
        .select("id")
        .single();

      if (!newSession) throw new Error("Session creation failed");

      cachedSessionId = newSession.id;

      if (message && !nameCheckDone) {
        nameCheckDone = true;
        await checkUserNameFromMessage(message, newSession.id);
      }

      return { id: newSession.id, isNew: true };
    } finally {
      sessionPromise = null;
    }
  })();

  return sessionPromise;
};

// =========================
// MESSAGE INSERT
// =========================
export const chatMessage = async (
  session_id: string,
  message: string,
  sender_type: string,
  sender_id?: string | null,
  tokens_used?: number,
  ai_model?: string,
  ai_confidence?: number | null,
  retrieved_documents?: any,
) => {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id,
      sender_type,
      sender_id: sender_id || null,
      message,
      tokens_used,
      ai_model,
      ai_confidence: ai_confidence || null,
      retrieved_documents: retrieved_documents || null,
    })
    .select();

  if (error) throw error;

  return data;
};

// =========================
// AI TRAINING LOG (refactored)
// =========================
export const ai_training_log = async (
  session_id: string,
  chatMessage_id: string | number,
) => {
  const { error } = await supabase.from("ai_training_logs").insert({
    session_id,
    message_id: chatMessage_id,
    issue_type: "Low confidence",
  });

  if (error) console.error("AI training log error:", error);
};

// =========================
// ANALYTICS
// =========================
export const analytic_event = async (user_id: string) => {
  await supabase.from("analytics_events").insert({
    event_type: "Assign Agent",
    user_id,
  });
};

// =========================
// MODERATION (refactored)
// =========================
export const moderation = async (
  session_id: string,
  message: string,
  category?: string,
) => {
  const { error } = await supabase.from("moderation_logs").insert({
    session_id,
    message,
    flagged_reason: category,
  });

  if (error) console.error("Moderation error:", error);
};

// =========================
// AGENT ASSIGNMENT (refactored)
// =========================
export async function assignAgent(
  session_id: string,
  chatMessage_id?: string | number,
) {
  if (chatMessage_id) {
    await ai_training_log(session_id, chatMessage_id);
    await analytic_event(getuserID());
  }

  const { data: agent } = await supabase
    .from("support_agents")
    .select("*")
    .eq("status", "active")
    .limit(1);

  if (!agent?.length) return "No agent available";

  const agent_id = agent[0].id;

  await supabase
    .from("chat_sessions")
    .update({ assigned_agent_id: agent_id })
    .eq("id", session_id);

  await supabase
    .from("support_agents")
    .update({ status: "busy" })
    .eq("id", agent_id);

  return "Agent assigned";
}

// =========================
// MAIN HANDLER (RAG FLOW)
// =========================
export const handleSubmit = async (message: string) => {
  const sender_id = getuserID();
  const { id: session_id } = await chatSession(message);

  const { data: functionData, error } = await supabase.functions.invoke(
    "generate-embedding",
    {
      body: { text: message },
    },
  );

  if (error || !functionData?.embedding) {
    throw new Error("Embedding generation failed");
  }

  const queryEmbedding = functionData.embedding;

  await chatMessage(session_id, message, "user", sender_id, 0);

  const { data: matchData } = await supabase.rpc("match_knowledge_base", {
    query_embedding: queryEmbedding,
    match_count: 5,
  });

  const retrieved_documents = matchData;
  const ai_confidence = matchData?.[0]?.similarity || 0;

  const context = matchData
    ? matchData.map((d: any) => d.content).join("\n\n")
    : "";

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful support assistant. Answer only using context.",
      },
      {
        role: "user",
        content: `Context:${context} Question:${message}`,
      },
    ],
  });

  const answer =
    completion.choices[0].message.content ||
    "Sorry, I couldn't generate a response.";

  const tokens_used = completion.usage?.total_tokens || 0;

  const data = await chatMessage(
    session_id,
    answer,
    "ai",
    null,
    tokens_used,
    "text-embedding-3-small",
    ai_confidence,
    retrieved_documents,
  );

  const chatMessage_id = data[0].id;

  if (ai_confidence < 0.4) {
    await assignAgent(session_id, chatMessage_id);
    return [
      "Sorry, confidence is low. A support agent will get back to you.",
      chatMessage_id,
    ];
  }

  return [answer, chatMessage_id];
};

// =========================
// SEND MESSAGE (ENTRY POINT)
// =========================
export async function sendChatMessage({ question }: { question: string }) {
  const sender_id = getuserID();

  const { data: functionData } = await supabase.functions.invoke(
    "moderateMessage",
    {
      body: { text: question },
    },
  );

  if (!functionData) {
    await moderation("", question);
    return ["Moderation failed", null];
  }

  const { intent } = functionData;

  // CASUAL
  if (intent === "casual") {
    const { data: casualData } = await supabase.functions.invoke(
      "super-api",
      {
        body: { text: question },
      },
    );

    const { id: session_id } = await chatSession(question);

    await chatMessage(session_id, question, "user", sender_id, 0);
    const data = await chatMessage(
      session_id,
      casualData?.response || "Hey 👋",
      "ai",
      null,
      0,
    );

    return [casualData?.response || "Hey 👋", data[0].id];
  }

  // ESCALATION
  if (intent === "escalation") {
    const { id: session_id } = await chatSession(question);

    await chatMessage(session_id, question, "user", sender_id, 0);

    await assignAgent(session_id);

    const msg = "A support agent is being assigned to you. Please wait.";
    const data = await chatMessage(session_id, msg, "ai", null, 0);

    return [msg, data[0].id];
  } 

  // HARMFUL
  if (intent === "harmful") {
    const category = Object.keys(functionData.categories || {}).find(
      (k) => functionData.categories[k],
    );

    const { id: session_id } = await chatSession(question);

    await moderation(session_id, question, category);

    return ["Message blocked due to policy violation.", null];
  }

  // DEFAULT (RAG)
  return await handleSubmit(question);
}