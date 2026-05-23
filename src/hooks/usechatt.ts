/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";

import { Message } from "types/chatt";

// eslint-disable-next-line prettier/prettier
import { sendChatMessage, assignAgent } from 'api/chatt';
import { supabase } from "api/supabase";
import { chatSession } from "api/chatt";


export function useChat() {

  useEffect(() => {
    const getMessages = async () => {
      const session_id = await chatSession();
      console.log("session_id", session_id);

      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session_id);

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      console.log("messages", messages);
      setMessages(messages);
    }
    getMessages()
  },[])

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello 👋 How can I help you today?",
      sender: "other",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // USER MESSAGE
    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      // TEMP SESSION ID
      const sessionId = crypto.randomUUID();

      // AI RESPONSE
      const Response = await sendChatMessage({
        sessionId,
        question: text,
      });

      const [aiResponse, chatMessage_id] = Response;
      console.log("chatMessage_id", chatMessage_id);

      if (!aiResponse) {
        await assignAgent(chatMessage_id);
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse || "No response generated.",
        sender: "other",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      await assignAgent();
      console.error(error);

      const errorMessage: Message = {
        id: Date.now() + 2,
        text: "Sorry, there was an error. A support agent will get back to you shortly.",
        sender: "other",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
  };
}
