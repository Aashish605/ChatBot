/* eslint-disable prettier/prettier */
import { openai } from "./openai";
import { supabase } from "./supabase";
import { useAuthStore } from "store/authStore";



// get userID
export const getuserID = () => {
  const userID = useAuthStore.getState().user?.id;
  if (userID) {
    return userID;
  }
  else {
    console.error("No user found in the users table.");
    return null;
  }
};

//Find the chat session if not found create new session
export const chatSession = async () => {
  const user_id = getuserID();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("user_id", user_id)
    .eq("status", "open")
    .order("last_message_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching chat session:", error);
    throw new Error(error.message || "Failed to fetch chat session");
  }
  if (data && data.length > 0) {
    console.log("data from the session table", data);
    return data[0].id;
  }

  // 3. Otherwise, create a new one
  const { data: newSession, error: createError } = await supabase
    .from("chat_sessions")
    .insert({
      user_id,
      status: "open",
      source: "web",
    })
    .select("id"); // Optimization: Only select the 'id' back

  if (createError || !newSession || newSession.length === 0) {
    console.error("Error creating chat session:", createError);
    throw new Error(createError?.message || "Failed to create chat session");
  }

  return newSession[0].id;
};


// insert the data in message table
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

// handle the the user query and response 
export const handleSubmit = async (message: string) => {
  const sender_id = getuserID();
  const session_id = await chatSession();

  // calling the edge function
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

  console.log("ai_confidence", ai_confidence);

  const context = matchData ? matchData.map((doc: any) => doc.content).join("\n\n") : "";


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

  if (ai_confidence < 0.4) {
    console.log("sorry the confidence is low")
    await assignAgent(chatMessage_id)
    return ["Sorry, the confidence score is low.A support agent will get back to you soon", chatMessage_id];
  }

  return [answer, chatMessage_id];
};

// handel the data from the chat file and  do moderation check
export async function sendChatMessage({
  question,
}: {
  question: string;
}) {
  const { data: functionData, error: functionError } =
    await supabase.functions.invoke("moderateMessage", {
      body: { text: question },
    });

  const categories = functionData.categories;
  const flaggedCategory = Object.keys(categories).find(key => categories[key] === true);

  if (functionError || !functionData) {
    await moderation(question, flaggedCategory);
    return (functionError?.message || "Moderation Check Failed");
  }

  const isFlagged = functionData.flagged;

  if (isFlagged) {
    await moderation(question, flaggedCategory);
    return ["Message blocked due to policy violation. Please try again.", null]
  }

  return await handleSubmit(question);
}

// assign the support agen
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

// add data into the trainign log table
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


// add data to analytic event
export const analytic_event = async () => {
  await supabase.from("analytics_events").insert({
    event_type: "Assign Agent",
    user_id: getuserID(),
  })
}



// add data into the moderation table 
export const moderation = async (message: string, catogery?: string) => {
  const { error } = await supabase.from("moderation_logs").insert({
    session_id: await chatSession(),
    message,
    flagged_reason:catogery ,

  })
  console.log("data from the moderation table",error)
}