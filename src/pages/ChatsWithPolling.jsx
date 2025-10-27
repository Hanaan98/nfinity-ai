// src/pages/ChatsWithPolling.jsx
import React from "react";
import Chats from "./Chats";

/**
 * Enhanced Chats page with real-time polling
 * Follows the integration guide: polls /chat/all every 5 seconds for regular chat updates
 *
 * This component passes polling configuration to the Chats component
 * The actual polling is handled by the enhanced useChats hook
 */
const ChatsWithPolling = () => {
  return (
    <div className="relative">
      {/* Original Chats Component with polling enabled */}
      <Chats enablePolling={true} pollInterval={5000} />
    </div>
  );
};

export default ChatsWithPolling;
