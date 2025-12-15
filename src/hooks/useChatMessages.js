// src/hooks/useChatMessages.js
import { useState, useEffect, useCallback } from "react";
import { chatApi, ApiError } from "../services/api";

export function useChatMessages(sessionId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async (chatSessionId) => {
    if (!chatSessionId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await chatApi.getChatMessages(chatSessionId);

      if (response && response.chat && response.chat.messages) {
        // Parse the messages from your API format
        const parsedMessages = response.chat.messages.map((msg) => {
          // Convert timestamp to readable format
          const date = new Date(msg.created_at * 1000);
          const now = new Date();
          const diffMs = now - date;
          const diffMins = Math.floor(diffMs / 60000);

          let formattedTime;
          if (diffMins < 1) {
            formattedTime = "Just now";
          } else if (diffMins < 60) {
            formattedTime = `${diffMins}m ago`;
          } else if (diffMins < 1440) {
            formattedTime = `${Math.floor(diffMins / 60)}h ago`;
          } else {
            formattedTime = `${Math.floor(diffMins / 1440)}d ago`;
          }

          // Handle different content formats
          let content = msg.content;
          let originalContent = msg.content;

          // Handle OpenAI format: content is an array with type/text structure
          if (Array.isArray(msg.content)) {
            const textContent = msg.content.find(c => c.type === 'text');
            if (textContent && textContent.text && textContent.text.value) {
              content = textContent.text.value;
            } else {
              content = JSON.stringify(msg.content, null, 2);
            }
          } else if (typeof msg.content === "object" && msg.content !== null) {
            // Handle complex response formats (product recommendations, etc.)
            if (msg.content.message) {
              content = msg.content.message;
            } else if (msg.content.text) {
              content = msg.content.text;
            } else if (typeof msg.content === "string") {
              content = msg.content;
            } else {
              // Fallback for unhandled object formats
              content = JSON.stringify(msg.content, null, 2);
            }
          }

          return {
            id: msg.id,
            role: msg.role,
            content: content,
            originalContent: originalContent, // Keep original for special rendering
            timestamp: msg.created_at,
            formattedTime: formattedTime,
            created_at: msg.created_at,
          };
        });

        // Sort messages by creation time (oldest first)
        parsedMessages.sort((a, b) => a.created_at - b.created_at);

        setMessages(parsedMessages);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(
        err instanceof ApiError ? err.message : "Failed to load messages"
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages(sessionId);
  }, [fetchMessages, sessionId]);

  const refresh = useCallback(() => {
    fetchMessages(sessionId);
  }, [fetchMessages, sessionId]);

  return {
    messages,
    loading,
    error,
    refresh,
  };
}
