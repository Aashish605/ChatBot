/* eslint-disable prettier/prettier */
import { error } from "console";
import { openai } from "./openai";
import { supabase } from "./supabase";

export const getuserID = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user.id;

  // Fallback if no active auth session is detected
  const { data, error } = await supabase.from("users").select("id").limit(1);
  if (error || !data || data.length === 0) {
    throw new Error("No user found in the users table.");
  }
  return data[0].id;
};

export const chatSession = async () => {
  const user_id = await getuserID();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", user_id)
    .eq("status", "open")
    .order("last_message_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching chat session:", error);
  }

  if (data && data.length > 0) {
    return data[0].id;
  } else {
    const { data: newSession, error: createError } = await supabase
      .from("chat_sessions")
      .insert({
        user_id,
        status: "open",
        source: "web",
      })
      .select();

    if (createError || !newSession || newSession.length === 0) {
      throw new Error(createError?.message || "Failed to create chat session");
    }
    return newSession[0].id;
  }
};

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

  if (error) {
    console.error("Error saving message:", error);
    throw error;
  }

  console.log("Message Saved:", data);
  return data;
};

export const handleSubmit = async (message: string) => {
  const sender_id = await getuserID();
  const session_id = await chatSession();

  const { data: functionData, error: functionError } =
    await supabase.functions.invoke("generate-embedding", {
      body: { text: message },
    });

  if (functionError || !functionData || !functionData.embedding) {
    throw new Error(
      functionError?.message || "Embedding generation failed via Edge Function",
    );
  }

  const queryEmbedding = functionData.embedding;

  // Save the user's message
  await chatMessage(
    session_id,
    message,
    "user",
    sender_id,
    0,
    "text-embedding-3-small",
  );

  // Match against knowledge base
  const { data: matchData, error: matchError } = await supabase.rpc(
    "match_knowledge_base",
    {
      query_embedding: queryEmbedding,
      match_count: 5,
    },
  );

  if (matchError) {
    console.error("RPC match_knowledge_base error:", matchError);
    throw matchError;
  }

  const retrieved_documents = matchData;
  const ai_confidence = matchData && matchData.length > 0 ? matchData[0].similarity : 0;
  console.log("AI Confidence:", ai_confidence);


  const context = matchData ? matchData.map((doc: any) => doc.content).join("\n\n") : "";

  console.log("Retrieved context:", context);

  // Generate completions using OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `You are a helpful support assistant.Answer only using provided context.`,
      },
      {
        role: "user",
        content: `Context:${context} Question:${message}`,
      },
    ],
  });


  console.log("openai", completion);

  const tokens_used = completion.usage?.total_tokens || 0;
  const answer = completion.choices[0].message.content;

  // Save the AI's response
  const data = await chatMessage(
    session_id,
    answer || "Sorry, I couldn't generate a response.",
    "ai",
    null,
    tokens_used,
    "text-embedding-3-small",
    ai_confidence,
    retrieved_documents,
  );

  const chatMessage_id = data[0].id;
  console.log("chatMessage_id", chatMessage_id);

  if (ai_confidence < 0.4) {
    console.log("sorry the confidence is low")
    await assignAgent(chatMessage_id)
    return ["Sorry, the confidence score is low.A support agent will get back to you soon", chatMessage_id];
  }


  return [answer, chatMessage_id];
};

export async function sendChatMessage({
  question,
}: {
  question: string;
}) {
  const { data: functionData, error: functionError } =
    await supabase.functions.invoke("moderateMessage", {
      body: { text: question },
    });

  console.log("function data", functionData);
  console.log("function error", functionError);

  if (functionError || !functionData) {
    throw new Error(functionError?.message || "Moderation Check Failed");
  }

  const isFlagged = functionData.flagged;

  if (isFlagged) {
    return ["Message blocked due to policy violation. Please try again.",null]
  }

  return await handleSubmit(question);
}


export async function assignAgent(chatMessage_id?: string | number) {
  if (chatMessage_id) {
    await ai_training_log(chatMessage_id);
    await analytic_event();
  }
  const session_id = await chatSession();
  const { data: agent, error: agentError } = await supabase.from("support_agents").select("*").eq("status", "active").limit(1)
  if (agentError || !agent || agent.length === 0) {
    console.log("No agent available")
    return "No agent available"
  }
  console.log(agent)
  const agent_id = agent[0].id
  console.log(agent_id, session_id)


  const { error } = await supabase.from("chat_sessions").update({ assigned_agent_id: agent_id }).eq("id", session_id).select()
  if (error) {
    console.error("Error assigning agent:", error);
    return "Problem Assigning"
  }
  await supabase.from("support_agents").update({ status: "busy" }).eq("id", agent_id).select()
  console.log("Agent assigned")
  return "Agent assigned"

}




export const ai_training_log = async (chatMessage_id: string | number) => {
  const { error } = await supabase.from("ai_training_logs").insert({
    session_id: await chatSession(),
    message_id: chatMessage_id,
    issue_type: "Low confidence"
  }).select()

  if (error) {
    console.error("Error creating AI training log:", error);
  }
}



export const analytic_event = async () => {
  await supabase.from("analytics_events").insert({
    event_type: "Assign Agent",
    user_id: await getuserID(),
  })
}






export async function handleUserMessage(message: string, sessionId: string, userId: string) {

  // 1. MODERATION CHECK FIRST
  const moderation = await moderateMessage(message);

  if (moderation.flagged) {

    await supabase.from("moderation_logs").insert({
      chat_session_id: sessionId,
      user_id: userId,
      message,
      flagged: true,
      categories: moderation.categories,
      severity: "high",
      action_taken: "block",
    });

    // optional escalation
    await createEscalation(sessionId, "moderation_flag");

    return {
      error: "Your message was flagged by safety filters.",
    };
  }

  // 2. If safe → continue normal flow
  const aiResponse = await sendChatMessage({
    sessionId,
    question: message,
  });

  return aiResponse;
}