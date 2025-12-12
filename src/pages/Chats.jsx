// src/pages/Chats.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customer");

  console.log("Chats component - customerId from URL:", customerId);
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
  const [activeId, setActiveId] = useState(null);

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
      className={`w-full h-[calc(100vh-57px)] ${PAGE_BG} text-gray-100 flex flex-col`}
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
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3 h-9 rounded-md bg-[#151a1e] border border-[#293239] text-sm text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40"
                  placeholder="Search chats"
                />
              </div>
              <button
                onClick={refresh}
                className="px-3 h-9 text-xs rounded-md border border-[#293239] bg-[#1a2126] text-gray-300 hover:bg-white/5 flex items-center gap-1.5"
                title="Refresh chats"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>
            </div>

            {!customerId && (
              <div className="mt-3 flex gap-1">
                {["all", "unread", "active", "closed"].map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-2.5 py-1.5 text-xs rounded-md border flex items-center gap-1.5 ${
                      filter === filterOption
                        ? "border-blue-800 bg-blue-900/30 text-blue-100"
                        : "border-[#293239] bg-[#1a2126] text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {filterOption === "unread" && (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                    {filterOption === "active" && (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                    {filterOption === "closed" && (
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    )}
                    {filterOption.charAt(0).toUpperCase() +
                      filterOption.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat list */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ul className={`${DIVIDER}`}>
              {loading ? (
                <li className="p-3">
                  <ChatListSkeleton rows={6} />
                </li>
              ) : (
                (chats || []).map((chat) => (
                  <ChatListItem
                    key={chat.sessionId}
                    chat={chat}
                    isActive={activeId === chat.sessionId}
                    onClick={() => setActiveId(chat.sessionId)}
                  />
                ))
              )}

              {!loading && (chats || []).length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-gray-400">
                  No chats found
                </li>
              )}
            </ul>
          </div>

          {/* Footer with pagination */}
          <div className="px-4 py-3 border-t border-[#293239] flex-shrink-0 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing {(chats || []).length} of {pagination.totalChats}
            </p>
            <div className="flex items-center gap-2">
              <button
                className={`${BTN} ${
                  pagination.currentPage === 1
                    ? "opacity-40 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Prev
              </button>
              <span className="text-xs text-gray-400">
                Page {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                className={`${BTN} ${
                  pagination.currentPage === pagination.totalPages
                    ? "opacity-40 cursor-not-allowed"
                    : ""
                }`}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
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
    switch (status) {
      case "active":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      case "unread":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <li
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer transition-colors ${
        isActive
          ? "bg-white/[0.06] border-r-2 border-r-blue-500"
          : "hover:bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#0f1a20] border border-[#293239]">
            {chat.customer.initials ? (
              <span className="text-xs font-medium text-gray-300">
                {chat.customer.initials}
              </span>
            ) : (
              <svg
                className="w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M16 14a4 4 0 10-8 0v1h8v-1z" />
                <circle cx="12" cy="6" r="3" />
              </svg>
            )}
          </span>
          {/* Status indicator */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-[#1d2328] ${getStatusColor(
              chat.status
            )}`}
            title={`Status: ${chat.status}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <p className="truncate text-sm font-medium text-gray-200">
                {chat.customer.name}
              </p>
              {!chat.isRead && (
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] text-blue-400 font-medium">
                    NEW
                  </span>
                </div>
              )}
            </div>
            <span className="text-[11px] text-gray-400 shrink-0">
              {chat.latestMessage?.formattedTime || chat.lastActivity}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="truncate text-xs text-gray-400">
              {chat.customer.email || `${chat.conversationType} conversation`}
            </p>
            <span className="text-[10px] text-gray-500 shrink-0">
              {chat.messageCount} msgs
            </span>
          </div>
          <p className="truncate text-sm text-gray-300 mt-1">
            {chat.latestMessage?.content}
          </p>
        </div>
      </div>
    </li>
  );
}

function ChatHeader({ activeChat }) {
  return (
    <div className={`px-5 py-4 ${BORDER} ${CARD_BG} border-l-0 flex-shrink-0`}>
      {activeChat ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#0f1a20] border border-[#293239]">
                {activeChat.customer.initials ? (
                  <span className="text-sm font-medium text-gray-300">
                    {activeChat.customer.initials}
                  </span>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M16 14a4 4 0 10-8 0v1h8v-1z" />
                    <circle cx="12" cy="6" r="3" />
                  </svg>
                )}
              </span>
              {/* Status indicator in header */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#1d2328] ${
                  activeChat.status === "active"
                    ? "bg-green-500"
                    : activeChat.status === "closed"
                    ? "bg-gray-500"
                    : !activeChat.isRead
                    ? "bg-blue-500"
                    : "bg-gray-400"
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-gray-100">
                  {activeChat.customer.name}
                </p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeChat.status === "active"
                      ? "bg-green-900/30 text-green-300 border border-green-800"
                      : activeChat.status === "closed"
                      ? "bg-gray-900/30 text-gray-300 border border-gray-700"
                      : !activeChat.isRead
                      ? "bg-blue-900/30 text-blue-300 border border-blue-800"
                      : "bg-gray-900/30 text-gray-400 border border-gray-700"
                  }`}
                >
                  {!activeChat.isRead ? "unread" : activeChat.status}
                </span>
              </div>
              <p className="truncate text-xs text-gray-400">
                {activeChat.customer.email ||
                  `${activeChat.conversationType} conversation`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400">
              Last message{" "}
              {activeChat.latestMessage?.formattedTime ||
                activeChat.lastActivity}
            </span>
            <div className="text-xs text-gray-500 mt-1">
              {activeChat.messageCount} messages • Active conversation
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-400 mb-1">No conversation selected</p>
          <p className="text-xs text-gray-500">
            Choose a chat from the list to view the conversation
          </p>
        </div>
      )}
    </div>
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
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h2m2-4h6a2 2 0 012 2v6a2 2 0 01-2 2h-6m0-2v2a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2h-8V4z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            Welcome to Chats
          </h3>
          <p className="text-sm text-gray-400 mb-1">
            Select a conversation from the sidebar to start viewing
          </p>
          <p className="text-xs text-gray-500">
            Chat messages and history will appear here
          </p>
        </div>
      </div>
    );
  }

  if (messagesLoading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center text-sm text-gray-400">
        <div className="flex items-center space-x-3">
          <Spinner size="md" />
          <span className="text-gray-300">Loading messages...</span>
        </div>
      </div>
    );
  }

  if (messagesError) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center text-sm text-red-400">
        <div className="text-center">
          <div className="mb-2">⚠️ Failed to load messages</div>
          <div className="text-xs text-gray-500">{messagesError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="px-5 py-5 space-y-4">
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
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm mb-2">
              💬 No messages in this conversation yet
            </div>
            <div className="text-gray-500 text-xs">
              Messages will appear here when the conversation starts
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="text-center py-4">
            <div className="text-gray-500 text-xs">
              {messages.length} messages • Connected to API endpoint: GET /chat/
              {chat.sessionId}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-5 pb-5 flex items-center justify-center">
        <span className="text-[11px] text-gray-500 px-2 py-1 rounded border border-[#293239] bg-[#1d2328]">
          Read-only viewer
        </span>
      </div>
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
    <div className="max-w-[80%]">
      <div
        className={`px-3 py-2 rounded-lg text-sm break-words leading-relaxed ${
          isAI
            ? "bg-[#1d2328] border border-[#293239] text-gray-100"
            : "bg-blue-600 text-white border border-blue-500/30"
        }`}
      >
        {isProductRecommendation ? (
          <ProductRecommendation content={originalContent} />
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
      <div
        className={`mt-1 text-[11px] ${
          isAI ? "text-gray-500 pl-1" : "text-gray-300 pr-1 text-right"
        }`}
      >
        {isAI ? "AI" : "Customer"} • {at}
      </div>
    </div>
  );
}
