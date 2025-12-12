// src/pages/Orders.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
    <div className="w-full min-h-full bg-[#151a1e] text-gray-100">
      <div className="flex">
        {/* Left sticky rail */}
        <aside
          className={`hidden md:block sticky top-0 self-start h-[calc(100vh-0px)] w-64 pr-6 mr-6 ${borderClass}`}
          style={{ borderRightWidth: 1 }}
        >
          <div className="rounded-lg overflow-hidden h-full">
            <div className="px-4 py-3 text-sm font-semibold text-gray-300">
              Order lists
            </div>

            <nav className="px-4 pb-4 space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-md text-sm bg-blue-900/30 text-blue-100 border border-blue-800">
                All orders
              </button>
            </nav>

            <div className="mt-auto px-4 py-3 text-xs text-gray-500">
              Connected to API endpoint
            </div>
          </div>
        </aside>

        {/* Main column */}
        <section className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Orders</h1>
              <p className="mt-1 text-sm text-gray-400">
                Search and manage orders. Use{" "}
                <span className="text-gray-300">View in Shopify</span> to open
                the order in Admin.
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full max-w-lg">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  width="18"
                  height="18"
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
                className="w-full pl-10 pr-3 h-10 rounded-md bg-[#1d2328] border border-[#293239] text-sm text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40"
                placeholder="Search by order #, customer, email, status, or tag…"
              />
            </div>

            {/* Refresh button */}
            <button
              onClick={refresh}
              disabled={loading}
              className={`px-3 h-10 text-xs rounded-md border border-[#293239] bg-[#1a2126] text-gray-300 hover:bg-white/5 flex items-center gap-1.5 transition-all duration-200 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Refresh orders"
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
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
              )}
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <button
                className={BTN}
                onClick={() => toggleSort("CREATED_AT")}
                title="Sort by date"
              >
                Sort: Date{" "}
                {sortBy === "CREATED_AT"
                  ? sortOrder === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </button>
              <button
                className={BTN}
                onClick={() => toggleSort("ORDER_NUMBER")}
                title="Sort by order number"
              >
                Sort: Order #{" "}
                {sortBy === "ORDER_NUMBER"
                  ? sortOrder === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </button>
            </div>
          </div>

          {/* Count */}
          <div className="mt-4 text-sm text-gray-400">
            {pagination.totalOrders?.toLocaleString() || "0"} orders
          </div>

          {/* Table */}
          {loading ? (
            <div className="mt-3">
              <OrdersTableSkeleton rows={8} />
            </div>
          ) : (
            <div className="mt-3 rounded-lg overflow-hidden animate-fade-in-up">
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
                {displayOrders.map((order, index) => (
                  <div
                    key={order.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <OrderRow
                      order={order}
                      checked={!!checked[order.id]}
                      onCheck={(checked) =>
                        setChecked((prev) => ({ ...prev, [order.id]: checked }))
                      }
                      adminBaseUrl={adminBaseUrl}
                    />
                  </div>
                ))}

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
              <div className="px-4 py-3 flex items-center justify-between border-t border-[#293239]">
                <p className="text-xs text-gray-400">
                  Showing {displayOrders.length} of{" "}
                  {pagination.totalOrders || displayOrders.length} AI orders on
                  this page
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className={`${BTN} transition-all duration-200 ${
                      pagination.currentPage <= 1
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:scale-105"
                    }`}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                  >
                    Prev
                  </button>
                  <span className="text-xs text-gray-400">
                    Page {pagination.currentPage} /{" "}
                    {Math.max(1, pagination.totalPages)}
                  </span>
                  <button
                    className={`${BTN} transition-all duration-200 ${
                      pagination.currentPage >= pagination.totalPages
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:scale-105"
                    }`}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
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
    <li className={`px-4 py-3 hover:bg-white/2 border-b ${borderClass}`}>
      <div className="grid grid-cols-12 items-center">
        {/* checkbox + order */}
        <div className="col-span-3 md:col-span-3 flex items-center gap-3 min-w-0">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-[#293239] bg-transparent"
            checked={checked}
            onChange={(e) => onCheck(e.target.checked)}
            aria-label={`Select ${order.orderNumber || order.name}`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm text-blue-400">
                {formatOrderNumber(order.orderNumber || order.name)}
              </span>
              {adminUrl ? (
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded border border-[#293239] bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                  title="View in Shopify Admin"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <path d="M15 3h6v6" />
                    <path d="M10 14L21 3" />
                  </svg>
                  View
                </a>
              ) : (
                <span
                  className="text-[11px] px-1.5 py-0.5 text-gray-500"
                  title="Shopify shop URL not configured"
                >
                  No link
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-500">
              Shopify ID:{" "}
              <span className="text-gray-400">
                {order.shopifyOrderId || order.shopifyId || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* customer */}
        <div className="col-span-4 md:col-span-4 min-w-0">
          <div className="truncate text-sm text-gray-200">
            {order.customerName || order.customer || "Unknown Customer"}
          </div>
          <div className="truncate text-xs text-gray-400">
            {order.customerEmail || order.email || "No email"}
          </div>
        </div>

        {/* total */}
        <div className="col-span-2 md:col-span-2">
          <div className="text-sm text-gray-200">{formattedPrice}</div>
        </div>

        {/* status + created */}
        <div className="col-span-3 md:col-span-3">
          <div className="flex flex-wrap gap-1 mb-1">
            <span className={`${CHIP} ${getStatusColor(order.paymentStatus)}`}>
              pay: {order.paymentStatus || "unknown"}
            </span>
            <span
              className={`${CHIP} ${getStatusColor(order.fulfillmentStatus)}`}
            >
              fulfill: {order.fulfillmentStatus || "unknown"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mb-1">
            {(order.tags || []).slice(0, 2).map((tag) => (
              <span key={tag} className={CHIP}>
                {tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-400">
            {formatDate(order.createdAt)}
          </div>
        </div>
      </div>
    </li>
  );
}
