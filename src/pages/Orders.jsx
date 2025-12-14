// src/pages/Orders.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useOrders } from "../hooks/useOrders";
import {
  OrdersTableSkeleton,
  ErrorState,
  EmptyState,
  Spinner,
  ButtonLoader,
} from "../components/LoadingStates";

// ----- Theme bits (matching your Customers/Chats look) -----
const BTN = `px-2.5 py-1.5 text-xs rounded-md bg-[#1a2126] border border-[#293239] text-gray-300 hover:bg-white/5`;
const CHIP = `inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-gray-300 border border-[#293239]`;
const borderClass = "border-[#293239]";

// ----- Helpers -----
function useIndeterminate(checkedSome, checkedAll) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = checkedSome && !checkedAll;
    }
  }, [checkedSome, checkedAll]);
  return ref;
}

function buildAdminOrderUrl(orderId, adminBaseUrl) {
  // Prefer explicit baseUrl prop, else env var like: yourstore.myshopify.com
  const shop = adminBaseUrl || import.meta.env.VITE_SHOPIFY_SHOP;

  if (!shop || shop === "your-shop-name.myshopify.com") {
    // Return null to indicate no URL available (will hide link in UI)
    return null;
  }

  if (!orderId) {
    return null;
  }

  // Extract numeric ID from GraphQL ID format if needed
  // GraphQL format: "gid://shopify/Order/6021576327238"
  // We need just: "6021576327238"
  let numericOrderId = orderId;
  if (typeof orderId === "string" && orderId.includes("gid://shopify/Order/")) {
    numericOrderId = orderId.split("/").pop();
  }

  const base =
    shop.startsWith("http://") || shop.startsWith("https://")
      ? shop
      : `https://${shop}`;

  // Shopify Admin order URL accepts numeric id
  const adminUrl = `${base.replace(/\/$/, "")}/admin/orders/${numericOrderId}`;
  return adminUrl;
}

function formatPrice(order) {
  // Use backend's formatted price if available
  if (order.formattedTotalPrice) {
    return order.formattedTotalPrice;
  }

  // Fallback: handle different price formats
  if (order.totalPrice) {
    if (typeof order.totalPrice === "object" && order.totalPrice.amount) {
      // Shopify format: { amount: 150.00, currency: "USD" }
      return `${
        order.totalPrice.currency || "USD"
      } ${order.totalPrice.amount.toFixed(2)}`;
    }
    if (typeof order.totalPrice === "number") {
      // Already a number in dollars
      return `$${order.totalPrice.toFixed(2)}`;
    }
  }

  // Final fallback
  if (order.total) {
    if (typeof order.total === "number") {
      return `$${order.total.toFixed(2)}`;
    }
    return order.total;
  }

  return "N/A";
}

function formatOrderNumber(orderNumber) {
  // Ensure order number has # prefix
  const orderStr = String(orderNumber || "");
  return orderStr.startsWith("#") ? orderStr : `#${orderStr}`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "paid":
      return "bg-green-900/30 text-green-300 border-green-800";
    case "pending":
      return "bg-yellow-900/30 text-yellow-300 border-yellow-800";
    case "refunded":
      return "bg-red-900/30 text-red-300 border-red-800";
    case "fulfilled":
      return "bg-blue-900/30 text-blue-300 border-blue-800";
    case "unfulfilled":
      return "bg-gray-900/30 text-gray-300 border-gray-700";
    case "partial":
      return "bg-orange-900/30 text-orange-300 border-orange-800";
    default:
      return "bg-gray-900/30 text-gray-300 border-gray-700";
  }
}

// ----- Page -----
export default function Orders({ adminBaseUrl }) {
  // API state
  const { orders, loading, error, pagination, updateParams, refresh } =
    useOrders();

  // UI state
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("CREATED_AT"); // Shopify sortKey format
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" | "desc"

  // selection
  const [checked, setChecked] = useState({}); // id -> boolean

  // Update API params when UI changes
  useEffect(() => {
    updateParams({
      page: 1,
      search: query,
      sortBy: sortBy,
      sortOrder: sortOrder,
    });
  }, [query, sortBy, sortOrder, updateParams]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
  };

  // Use orders directly from API (backend handles sorting)
  const displayOrders = orders || [];

  // selection helpers
  const pageIds = displayOrders.map((o) => o.id);
  const allOnPageChecked =
    pageIds.length > 0 && pageIds.every((id) => checked[id]);
  const someOnPageChecked =
    pageIds.some((id) => checked[id]) && !allOnPageChecked;
  const headCheckboxRef = useIndeterminate(someOnPageChecked, allOnPageChecked);

  const toggleAllOnPage = (checkedAll) => {
    const next = { ...checked };
    pageIds.forEach((id) => (next[id] = checkedAll));
    setChecked(next);
  };

  const toggleSort = (key) => {
    if (sortBy === key) {
      // Toggle order if same key
      setSortOrder((s) => (s === "asc" ? "desc" : "asc"));
    } else {
      // New key - set default order
      setSortBy(key);
      setSortOrder(key === "CREATED_AT" ? "desc" : "asc"); // newest first for date, A-Z for order number
    }
  };

  if (error) {
    return (
      <div className="w-full min-h-full bg-[#151a1e] text-gray-100 p-6">
        <ErrorState
          title="Unable to Load Orders"
          message={error}
          onRetry={refresh}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-[#151a1e] text-gray-100 pl-6 pt-6">
      <div className="flex">
        {/* Left sticky rail */}
        <motion.aside
          className={`hidden md:block sticky top-0 self-start h-[calc(100vh-0px)] w-64 pr-6 mr-6 ${borderClass}`}
          style={{ borderRightWidth: 1 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-lg overflow-hidden h-full">
            <div className="px-4 py-4 text-sm font-bold text-gray-200 border-b border-[#293239]">
              Order lists
            </div>

            <nav className="px-4 py-4 space-y-2">
              <motion.button 
                whileHover={{ x: 4 }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm bg-gradient-to-br from-blue-900/40 to-blue-800/30 text-blue-200 border border-blue-700/50 shadow-lg shadow-blue-500/20 font-semibold"
              >
                All orders
              </motion.button>
            </nav>

            <div className="mt-auto px-4 py-3 text-xs text-gray-500 border-t border-[#293239]">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"
                />
                Connected to API endpoint
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main column */}
        <section className="flex-1 min-w-0 p-6">
          {/* Header */}
          <motion.div 
            className="flex items-start justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">Orders</h1>
              <p className="mt-2 text-sm text-gray-400">
                Search and manage orders. Use{" "}
                <span className="text-blue-400 font-semibold">View in Shopify</span> to open
                the order in Admin.
              </p>
            </div>
          </motion.div>

          {/* Toolbar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full max-w-lg">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg
                  width="18"
                  height="18"
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
                className="w-full pl-10 pr-4 h-11 rounded-lg bg-gradient-to-br from-[#1d2328] to-[#1a1f24] border border-[#293239] text-sm text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
                placeholder="Search by order #, customer, email, status, or tag…"
              />
            </div>

            {/* Refresh button */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              onClick={refresh}
              disabled={loading}
              className={`px-4 h-11 text-xs rounded-lg border border-[#293239] bg-gradient-to-br from-[#1a2126] to-[#151b20] text-gray-300 hover:bg-white/5 flex items-center gap-2 transition-all duration-200 font-medium shadow-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Refresh orders"
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
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
              )}
              {loading ? "Refreshing..." : "Refresh"}
            </motion.button>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${BTN} font-medium`}
                onClick={() => toggleSort("CREATED_AT")}
                title="Sort by date"
              >
                Sort: Date{" "}
                {sortBy === "CREATED_AT"
                  ? sortOrder === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${BTN} font-medium`}
                onClick={() => toggleSort("ORDER_NUMBER")}
                title="Sort by order number"
              >
                Sort: Order #{" "}
                {sortBy === "ORDER_NUMBER"
                  ? sortOrder === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </motion.button>
            </div>
          </div>

          {/* Count */}
          <motion.div 
            className="mt-4 text-sm font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-blue-400">{pagination.totalOrders?.toLocaleString() || "0"}</span>
            <span className="text-gray-400"> orders</span>
          </motion.div>

          {/* Table */}
          {loading ? (
            <div className="mt-3">
              <OrdersTableSkeleton rows={8} />
            </div>
          ) : (
            <motion.div 
              className="mt-3 rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* head */}
              <div
                className={`px-4 py-3 text-xs uppercase tracking-wide text-gray-400 border-b ${borderClass}`}
              >
                <div className="grid grid-cols-12">
                  <div className="col-span-3 md:col-span-3 flex items-center gap-3">
                    <input
                      ref={headCheckboxRef}
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#293239] bg-transparent"
                      aria-label="Select all on page"
                      onChange={(e) => toggleAllOnPage(e.target.checked)}
                      checked={allOnPageChecked}
                    />
                    <button
                      onClick={() => toggleSort("ORDER_NUMBER")}
                      className="inline-flex items-center gap-1 hover:text-gray-200"
                      title="Sort by order number"
                    >
                      <span>Order</span>
                      <svg
                        className="w-3 h-3 text-gray-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6-6 6 6M6 15l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                  <div className="col-span-4 md:col-span-4">
                    Customer / Email
                  </div>
                  <div className="col-span-2 md:col-span-2">Total</div>
                  <div className="col-span-3 md:col-span-3">
                    Status / Created
                  </div>
                </div>
              </div>

              {/* body */}
              <ul className={`divide-y ${borderClass}`}>
                <AnimatePresence mode="popLayout">
                  {displayOrders.map((order, index) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      checked={!!checked[order.id]}
                      onCheck={(checked) =>
                        setChecked((prev) => ({ ...prev, [order.id]: checked }))
                      }
                      adminBaseUrl={adminBaseUrl}
                    />
                  ))}
                </AnimatePresence>

                {!loading && displayOrders.length === 0 && (
                  <li className="px-4 py-12">
                    <EmptyState
                      title="No AI orders found"
                      message="No AI-generated orders match your search. Orders placed through the AI chatbot will appear here."
                      icon={
                        <svg
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      }
                    />
                  </li>
                )}
              </ul>

              {/* footer / pagination */}
              <motion.div 
                className="px-4 py-4 flex items-center justify-between border-t border-[#293239] bg-[#151a1e]/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-xs text-gray-400 font-medium">
                  Showing <span className="text-blue-400 font-bold">{displayOrders.length}</span> of{" "}
                  <span className="text-blue-400 font-bold">{pagination.totalOrders || displayOrders.length}</span> AI orders on
                  this page
                </p>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: pagination.currentPage > 1 ? 1.05 : 1 }}
                    whileTap={{ scale: pagination.currentPage > 1 ? 0.95 : 1 }}
                    className={`${BTN} transition-all duration-200 ${
                      pagination.currentPage <= 1
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-white/10"
                    }`}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                  >
                    Prev
                  </motion.button>
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-[#1a2126] border border-[#293239] font-semibold">
                    <span className="text-blue-400">{pagination.currentPage}</span>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-gray-300">{Math.max(1, pagination.totalPages)}</span>
                  </span>
                  <motion.button
                    whileHover={{ scale: pagination.currentPage < pagination.totalPages ? 1.05 : 1 }}
                    whileTap={{ scale: pagination.currentPage < pagination.totalPages ? 0.95 : 1 }}
                    className={`${BTN} transition-all duration-200 ${
                      pagination.currentPage >= pagination.totalPages
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-white/10"
                    }`}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                  >
                    Next
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

function OrderRow({ order, checked, onCheck, adminBaseUrl }) {
  const adminUrl = buildAdminOrderUrl(
    order.shopifyOrderId || order.shopifyId || order.id,
    adminBaseUrl
  );

  // Get properly formatted price
  const formattedPrice = formatPrice(order);

  // Get currency
  const currency = order.totalPrice?.currency || order.currency || "USD";

  return (
    <motion.li 
      className={`px-4 py-4 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-transparent border-b ${borderClass} transition-all cursor-pointer group`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="grid grid-cols-12 items-center">
        {/* checkbox + order */}
        <div className="col-span-3 md:col-span-3 flex items-center gap-3 min-w-0">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-[#293239] bg-transparent cursor-pointer"
            checked={checked}
            onChange={(e) => onCheck(e.target.checked)}
            aria-label={`Select ${order.orderNumber || order.name}`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                {formatOrderNumber(order.orderNumber || order.name)}
              </span>
              {adminUrl ? (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all shadow-sm"
                  title="View in Shopify Admin"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <path d="M15 3h6v6" />
                    <path d="M10 14L21 3" />
                  </svg>
                  View
                </motion.a>
              ) : (
                <span
                  className="text-[11px] px-2 py-1 text-gray-500"
                  title="Shopify shop URL not configured"
                >
                  No link
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-500">
              Shopify ID:{" "}
              <span className="text-gray-400 font-mono">
                {order.shopifyOrderId || order.shopifyId || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* customer */}
        <div className="col-span-4 md:col-span-4 min-w-0">
          <div className="truncate text-sm font-medium text-gray-200">
            {order.customerName || order.customer?.fullName || order.customer?.name || "Unknown Customer"}
          </div>
          <div className="truncate text-xs text-gray-400">
            {order.customerEmail || order.customer?.email || order.email || "No email"}
          </div>
        </div>

        {/* total */}
        <div className="col-span-2 md:col-span-2">
          <div className="text-sm font-bold text-green-400">{formattedPrice}</div>
        </div>

        {/* status + created */}
        <div className="col-span-3 md:col-span-3">
          <div className="flex flex-wrap gap-1 mb-1">
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className={`${CHIP} ${getStatusColor(order.paymentStatus)} font-semibold`}
            >
              pay: {order.paymentStatus || "unknown"}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`${CHIP} ${getStatusColor(order.fulfillmentStatus)} font-semibold`}
            >
              fulfill: {order.fulfillmentStatus || "unknown"}
            </motion.span>
          </div>
          <div className="flex flex-wrap gap-1 mb-1">
            {(order.tags || []).slice(0, 2).map((tag, index) => (
              <motion.span 
                key={tag} 
                className={`${CHIP} text-blue-400`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
          <div className="text-xs text-gray-400 font-medium">
            {formatDate(order.createdAt)}
          </div>
        </div>
      </div>
    </motion.li>
  );
}
