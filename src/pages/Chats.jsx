// src/pages/Chats.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useChats } from "../hooks/useChats";
import { useChatMessages } from "../hooks/useChatMessages";
import { formatTimeAgo } from "../utils/messageHelpers";
import ProductRecommendation from "../components/ProductRecommendation";
import {
  ChatListSkeleton,
  ErrorState,
  EmptyState,
  Spinner,
  Skeleton,
} from "../components/LoadingStates";

const PAGE_BG = "bg-[#151a1e]";
const CARD_BG = "bg-[#1d2328]";
const BORDER = "border border-[#293239]";
const DIVIDER = "divide-y divide-[#293239]";
const BTN =
  "px-2.5 py-1.5 text-xs rounded-md bg-[#1a2126] border border-[#293239] text-gray-300 hover:bg-white/5";

export default function Chats({
  enablePolling = false,
  pollInterval = 5000,
} = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sessionId: sessionIdFromRoute } = useParams();
  const navigate = useNavigate();
  const customerId = searchParams.get("customer");
  const sessionIdFromQuery = searchParams.get("sessionId");
  
  // Prioritize route param over query param
  const sessionIdFromUrl = sessionIdFromRoute || sessionIdFromQuery;

  console.log("Chats component - customerId from URL:", customerId);
  console.log("Chats component - sessionId from route:", sessionIdFromRoute);
  console.log("Chats component - sessionId from query:", sessionIdFromQuery);
  console.log("Chats component - polling enabled:", enablePolling);

  // API state
  const {
    chats,
    loading,
    error,
    pagination,
    updateParams,
    markAsRead,
    refresh,
    lastUpdated,
    isPolling,
  } = useChats({
    customerId,
    enablePolling,
    pollInterval,
  });
  // UI state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeId, setActiveId] = useState(sessionIdFromUrl || null);

  // Sync activeId with URL sessionId parameter
  useEffect(() => {
    if (sessionIdFromUrl && sessionIdFromUrl !== activeId) {
      setActiveId(sessionIdFromUrl);
    }
  }, [sessionIdFromUrl]);

  // Update URL when activeId changes (use navigate for clean URLs)
  useEffect(() => {
    if (activeId) {
      // Build the URL with customer filter if present
      const queryString = customerId ? `?customer=${customerId}` : '';
      navigate(`/chats/${activeId}${queryString}`, { replace: true });
    } else if (sessionIdFromRoute) {
      // If activeId is cleared but we're on a route with sessionId, go back to base chats
      const queryString = customerId ? `?customer=${customerId}` : '';
      navigate(`/chats${queryString}`, { replace: true });
    }
  }, [activeId, customerId, navigate, sessionIdFromRoute]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Update API params when filters or debounced query changes
  useEffect(() => {
    updateParams({
      page: 1, // Reset to first page when filters change
      filter: filter,
      search: debouncedQuery,
    });
  }, [debouncedQuery, filter, updateParams]);

  // Find active chat
  const activeChat = useMemo(
    () => chats?.find((c) => c.sessionId === activeId) || null,
    [chats, activeId]
  );

  // Mark as read when chat is opened
  useEffect(() => {
    if (activeChat && !activeChat.isRead) {
      markAsRead(activeChat.sessionId);
    }
  }, [activeChat, markAsRead]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
  };

  // Handle chat click
  const handleChatClick = (chat) => {
    setActiveId(chat.sessionId);
  };

  if (error) {
    return (
      <div
        className={`w-full h-screen ${PAGE_BG} text-gray-100 flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ Error loading chats</div>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <button
            onClick={refresh}
            className={`${BTN} bg-red-900/20 border-red-800 text-red-200 hover:bg-red-900/30`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-[calc(100vh-57px)] ${PAGE_BG} text-gray-100 flex flex-col py-6 pl-6`}
    >
      <div className="flex flex-1 min-h-0">
        {/* LEFT: Chat list */}
        <aside
          className={`w-full md:w-96 xl:w-[28rem] ${CARD_BG} border-r border-r-[#293239] flex flex-col`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#293239] flex-shrink-0 bg-[#1d2328]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-lg font-semibold">
                  {customerId ? "Customer Chats" : "Chats"}
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-gray-400">
                    {customerId
                      ? `Viewing conversations for customer ${customerId}`
                      : "View customer conversations with the AI"}
                  </p>
                  {isPolling && lastUpdated && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span>Live</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {customerId && (
              <div className="mt-3">
                <a
                  href="/customers"
                  className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 12H6m6-7l-7 7 7 7" />
                  </svg>
                  Back to All Customers
                </a>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </span>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 h-10 rounded-lg bg-gradient-to-br from-[#151a1e] to-[#1a1f24] border border-[#293239] text-sm text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
                  placeholder="Search conversations..."
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refresh}
                className="px-3.5 h-10 text-xs rounded-lg border border-[#293239] bg-gradient-to-br from-[#1a2126] to-[#151b20] text-gray-300 hover:bg-white/5 flex items-center gap-2 font-medium shadow-lg transition-all"
                title="Refresh chats"
              >
                <motion.svg
                  animate={{ rotate: loading ? 360 : 0 }}
                  transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </motion.svg>
                Refresh
              </motion.button>
            </div>

            {!customerId && (
              <motion.div
                className="mt-3 flex gap-2"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {["all", "unread", "active", "closed"].map((filterOption, index) => (
                  <motion.button
                    key={filterOption}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(filterOption)}
                    className={`px-3 py-2 text-xs rounded-lg border flex items-center gap-2 font-semibold transition-all shadow-md ${
                      filter === filterOption
                        ? "border-blue-700 bg-gradient-to-br from-blue-900/40 to-blue-800/30 text-blue-200 shadow-blue-500/20"
                        : "border-[#293239] bg-gradient-to-br from-[#1a2126] to-[#151b20] text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {filterOption === "unread" && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
                      />
                    )}
                    {filterOption === "active" && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"
                      />
                    )}
                    {filterOption === "closed" && (
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                    )}
                    {filterOption.charAt(0).toUpperCase() +
                      filterOption.slice(1)}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Chat list */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <ul className={`${DIVIDER}`}>
              {loading ? (
                <li className="p-3">
                  <ChatListSkeleton rows={6} />
                </li>
              ) : (
                <AnimatePresence mode="popLayout">
                  {(chats || []).map((chat) => (
                    <ChatListItem
                      key={chat.sessionId}
                      chat={chat}
                      isActive={chat.sessionId === activeChat?.sessionId}
                      onClick={() => handleChatClick(chat)}
                    />
                  ))}
                </AnimatePresence>
              )}

              {!loading && (chats || []).length === 0 && (
                <motion.li 
                  className="px-4 py-12 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm text-gray-300 font-semibold mb-1">No chats found</p>
                  <p className="text-xs text-gray-500">Try adjusting your filters or search query</p>
                </motion.li>
              )}
            </ul>
          </div>

          {/* Footer with pagination */}
          <motion.div 
            className="px-4 py-3.5 border-t border-[#293239] flex-shrink-0 flex items-center justify-between bg-[#151a1e]/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-gray-400 font-medium">
              Showing <span className="text-blue-400 font-bold">{(chats || []).length}</span> of <span className="text-blue-400 font-bold">{pagination.totalChats}</span>
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${BTN} ${
                  pagination.currentPage === 1
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-white/10"
                }`}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Prev
              </motion.button>
              <span className="text-xs px-3 py-1.5 rounded-lg bg-[#1a2126] border border-[#293239] font-semibold">
                <span className="text-blue-400">{pagination.currentPage}</span>
                <span className="text-gray-500 mx-1">/</span>
                <span className="text-gray-300">{pagination.totalPages}</span>
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${BTN} ${
                  pagination.currentPage === pagination.totalPages
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-white/10"
                }`}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        </aside>

        {/* RIGHT: Chat viewer */}
        <section className="flex-1 min-w-0 flex flex-col min-h-0">
          <ChatHeader activeChat={activeChat} />
          <ChatMessages chat={activeChat} />
        </section>
      </div>
    </div>
  );
}

function ChatListItem({ chat, isActive, onClick }) {
  const getStatusColor = (status) => {
    if (status === "active") return "bg-green-500";
    if (status === "closed") return "bg-gray-500";
    if (!chat.isRead) return "bg-blue-500";
    return "bg-gray-400";
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`px-4 py-3.5 cursor-pointer transition-all relative group ${
        isActive
          ? "bg-gradient-to-r from-blue-500/10 to-transparent border-r-2 border-r-blue-500"
          : "hover:bg-white/[0.04]"
      }`}
    >
      {/* Hover gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${isActive ? 'opacity-100' : ''}`} />
      
      <div className="flex items-start gap-3 relative z-10">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg">
            {chat.customer.initials ? (
              <span className="text-sm font-semibold text-blue-300">
                {chat.customer.initials}
              </span>
            ) : (
              <svg
                className="w-5 h-5 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 14a4 4 0 10-8 0v1h8v-1z" />
                <circle cx="12" cy="6" r="3" />
              </svg>
            )}
          </span>
          {/* Animated status indicator */}
          <motion.span
            animate={!chat.isRead ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#1d2328] shadow-lg ${getStatusColor(
              chat.status
            )}`}
            title={`Status: ${chat.status}`}
          />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <p className="truncate text-sm font-semibold text-gray-100">
                {chat.customer.name}
              </p>
              {!chat.isRead && (
                <motion.div 
                  className="flex items-center gap-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <motion.span 
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-2 w-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
                  />
                  <span className="text-[10px] text-blue-400 font-bold tracking-wide">
                    NEW
                  </span>
                </motion.div>
              )}
            </div>
            <span className="text-[11px] text-gray-400 shrink-0 font-medium">
              {chat.latestMessage?.formattedTime || chat.lastActivity}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="truncate text-xs text-gray-400">
              {chat.customer.email || `${chat.conversationType} conversation`}
            </p>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 shrink-0 font-medium border border-blue-500/20">
              {chat.messageCount}
            </span>
          </div>
          <p className="truncate text-sm text-gray-300 leading-snug">
            {chat.latestMessage?.content}
          </p>
        </div>
      </div>
    </motion.li>
  );
}

function ChatHeader({ activeChat }) {
  return (
    <motion.div 
      className={`px-6 py-5 ${BORDER} ${CARD_BG} border-l-0 flex-shrink-0 shadow-lg`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {activeChat ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <motion.div 
              className="relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/40 shadow-xl">
                {activeChat.customer.initials ? (
                  <span className="text-base font-bold text-blue-300">
                    {activeChat.customer.initials}
                  </span>
                ) : (
                  <svg
                    className="w-6 h-6 text-blue-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 14a4 4 0 10-8 0v1h8v-1z" />
                    <circle cx="12" cy="6" r="3" />
                  </svg>
                )}
              </span>
              {/* Animated status indicator in header */}
              <motion.span
                animate={
                  activeChat.status === "active"
                    ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[#1d2328] shadow-lg ${
                  activeChat.status === "active"
                    ? "bg-green-500 shadow-green-500/50"
                    : activeChat.status === "closed"
                    ? "bg-gray-500"
                    : !activeChat.isRead
                    ? "bg-blue-500 shadow-blue-500/50"
                    : "bg-gray-400"
                }`}
              />
            </motion.div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <p className="truncate font-bold text-lg text-gray-100">
                  {activeChat.customer.name}
                </p>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    activeChat.status === "active"
                      ? "bg-green-900/30 text-green-300 border border-green-700/50 shadow-green-500/20 shadow-lg"
                      : activeChat.status === "closed"
                      ? "bg-gray-900/30 text-gray-300 border border-gray-700"
                      : !activeChat.isRead
                      ? "bg-blue-900/30 text-blue-300 border border-blue-700/50 shadow-blue-500/20 shadow-lg"
                      : "bg-gray-900/30 text-gray-400 border border-gray-700"
                  }`}
                >
                  {!activeChat.isRead ? "Unread" : activeChat.status.charAt(0).toUpperCase() + activeChat.status.slice(1)}
                </motion.span>
              </div>
              <p className="truncate text-sm text-gray-400 font-medium">
                {activeChat.customer.email ||
                  `${activeChat.conversationType} conversation`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 font-medium mb-1">
              Last message{" "}
              <span className="text-blue-400">
                {activeChat.latestMessage?.formattedTime ||
                  activeChat.lastActivity}
              </span>
            </div>
            <div className="flex items-center gap-3 justify-end text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3.293 3.293 3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
                {activeChat.messageCount} messages
              </span>
              <span className="h-1 w-1 rounded-full bg-gray-600" />
              <span>Active conversation</span>
            </div>
          </div>
        </div>
      ) : (
        <motion.div 
          className="text-center py-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div 
            className="text-gray-400 mb-3"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg
              className="w-14 h-14 mx-auto mb-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </motion.div>
          <p className="text-sm text-gray-300 mb-1 font-semibold">No conversation selected</p>
          <p className="text-xs text-gray-500">
            Choose a chat from the list to view the conversation
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function ChatMessages({ chat }) {
  const messagesEndRef = useRef(null);
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
  } = useChatMessages(chat?.sessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.sessionId, messages]);

  if (!chat) {
    return (
      <motion.div 
        className="flex-1 min-h-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center py-12">
          <motion.div 
            className="text-gray-500 mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <svg
              className="w-20 h-20 mx-auto mb-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h2m2-4h6a2 2 0 012 2v6a2 2 0 01-2 2h-6m0-2v2a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2h-8V4z"
              />
            </svg>
          </motion.div>
          <h3 className="text-xl font-bold text-gray-200 mb-2">
            Welcome to Chats
          </h3>
          <p className="text-sm text-gray-400 mb-1">
            Select a conversation from the sidebar to start viewing
          </p>
          <p className="text-xs text-gray-500">
            Chat messages and history will appear here
          </p>
        </div>
      </motion.div>
    );
  }

  if (messagesLoading) {
    return (
      <motion.div 
        className="flex-1 min-h-0 flex items-center justify-center text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3">
            <Spinner size="md" />
            <span className="text-gray-300 font-medium">Loading messages...</span>
          </div>
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-blue-500"
                animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (messagesError) {
    return (
      <motion.div 
        className="flex-1 min-h-0 flex items-center justify-center text-sm text-red-400"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center px-6 py-8 bg-red-900/10 border border-red-900/30 rounded-xl max-w-md">
          <svg className="w-12 h-12 mx-auto mb-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="font-semibold mb-2 text-red-300">Failed to load messages</div>
          <div className="text-xs text-red-400/80">{messagesError}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="px-6 py-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <MessageBubble
                  who={message.role}
                  at={message.formattedTime || message.timestamp}
                  content={message.content}
                  originalContent={message.originalContent}
                />
              </div>
            ))
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div 
                className="text-gray-400 text-sm mb-3"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </motion.div>
              <div className="text-gray-300 font-semibold mb-2">No messages yet</div>
              <div className="text-gray-500 text-xs">
                Messages will appear here when the conversation starts
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.length > 0 && (
          <motion.div 
            className="text-center py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 text-gray-500 text-xs px-3 py-1.5 rounded-full bg-[#1d2328] border border-[#293239]">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {messages.length} messages
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <motion.div 
        className="px-6 pb-6 flex items-center justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <span className="text-[11px] text-gray-500 px-3 py-1.5 rounded-full border border-[#293239] bg-[#1d2328] font-medium">
          Read-only viewer
        </span>
      </motion.div>
    </div>
  );
}

function MessageBubble({ who, at, content, originalContent }) {
  const isAI = who === "ai" || who === "assistant";

  // Check if this is a product recommendation
  const isProductRecommendation =
    originalContent &&
    typeof originalContent === "object" &&
    originalContent.ui_action === "show_products" &&
    originalContent.payload &&
    originalContent.payload.products;

  return (
    <motion.div 
      className="max-w-[75%]"
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`px-4 py-3 rounded-2xl text-sm break-words leading-relaxed shadow-lg backdrop-blur-sm ${
          isAI
            ? "bg-gradient-to-br from-[#1d2328] to-[#151b20] border border-[#293239] text-gray-100"
            : "bg-gradient-to-br from-blue-600 to-blue-700 text-white border border-blue-500/30 shadow-blue-500/20"
        }`}
      >
        {isProductRecommendation ? (
          <ProductRecommendation content={originalContent} />
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </motion.div>
      <div
        className={`mt-1.5 text-[11px] font-medium ${
          isAI ? "text-gray-500 pl-2" : "text-gray-400 pr-2 text-right"
        }`}
      >
        {isAI ? "AI Assistant" : "Customer"} • {at}
      </div>
    </motion.div>
  );
}
