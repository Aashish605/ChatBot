import { useState } from 'react';

import { Message } from 'types/chatt';

import { sendChatMessage } from 'api/chatt';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello 👋 How can I help you today?',
      sender: 'other',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  ]);

  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // USER MESSAGE
    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      // TEMP SESSION ID
      const sessionId = crypto.randomUUID();

      // AI RESPONSE
      const aiResponse = await sendChatMessage({
        sessionId,
        question: text
      });

      const botMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse || 'No response generated.',
        sender: 'other',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);

      const errorMessage: Message = {
        id: Date.now() + 2,
        text: 'Something went wrong.',
        sender: 'other',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage
  };
}