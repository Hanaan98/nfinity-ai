// src/hooks/useRecentChats.js
import { useChats } from "./useChats";

/**
 * Hook for getting the 5 most recent chats for dashboard display
 * Uses the enhanced useChats hook with polling enabled
 */
export function useRecentChats() {
  const { chats, loading, error, lastUpdated } = useChats({
    page: 1,
    limit: 5,
    filter: "all",
    enablePolling: true,
    pollInterval: 10000, // Poll every 10 seconds for dashboard (less frequent than chat page)
  });

  // Format chats for dashboard display
  const recentActivity =
    chats?.map((chat) => ({
      id: chat.id,
      type: "chat",
      message: `New ${chat.conversationType} conversation`,
      customer: chat.customerEmail || "Anonymous",
      timestamp: chat.lastMessageAt || chat.createdAt,
      sessionId: chat.sessionId,
      status: chat.status,
      conversationType: chat.conversationType,
    })) || [];

  return {
    recentActivity,
    loading,
    error,
    lastUpdated,
  };
}

export default useRecentChats;
