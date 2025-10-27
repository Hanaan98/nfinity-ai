// src/components/LoadingStates.jsx
import React from "react";

// Elegant spinner component
export function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        className="animate-spin text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

// Pulsating skeleton for cards and content
export function Skeleton({ className = "", children }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-[#1a2126] via-[#242a30] to-[#1a2126] bg-[length:200%_100%] rounded-md ${className}`}
    >
      {children}
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }) {
  return (
    <tr className="border-b border-[#293239]">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            {index === 0 && <Skeleton className="h-3 w-3/4" />}
          </div>
        </td>
      ))}
    </tr>
  );
}

// Orders table skeleton
export function OrdersTableSkeleton({ rows = 8 }) {
  return (
    <div className="rounded-lg overflow-hidden">
      {/* Header skeleton */}
      <div className="px-4 py-3 border-b border-[#293239] bg-[#1a2126]/50">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3 flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="col-span-4">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="col-span-3">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      {/* Body skeleton */}
      <div className="divide-y divide-[#293239]">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-4 py-3 hover:bg-white/2">
            <div className="grid grid-cols-12 items-center gap-4">
              {/* Checkbox + Order */}
              <div className="col-span-3 flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              {/* Customer */}
              <div className="col-span-4 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>

              {/* Total */}
              <div className="col-span-2">
                <Skeleton className="h-4 w-16" />
              </div>

              {/* Status + Date */}
              <div className="col-span-3 space-y-2">
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Chat list skeleton
export function ChatListSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="p-3 rounded-lg border border-[#293239] hover:bg-white/2"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-full" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Customer list skeleton
export function CustomerListSkeleton({ rows = 8 }) {
  return (
    <div className="rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3 border-b border-[#293239] bg-[#1a2126]/50">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="col-span-3">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#293239]">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="px-6 py-4 hover:bg-white/2 cursor-pointer"
          >
            <div className="grid grid-cols-12 items-center gap-4">
              <div className="col-span-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <div className="col-span-3">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="col-span-1">
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Full page loading with logo
export function PageLoader({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 bg-[#151a1e] flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        {/* Animated logo/brand */}
        <div className="relative">
          <div className="w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-400/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-blue-300 animate-spin animate-reverse animation-delay-150"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-200">{message}</h3>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline loading for buttons
export function ButtonLoader({ size = "sm" }) {
  return <Spinner size={size} className="mr-2" />;
}

// Error state component
export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an error while loading this content.",
  onRetry,
  showRetry = true,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 text-red-400">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-md">{message}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({
  title = "No data found",
  message = "There's nothing to display at the moment.",
  icon,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 text-gray-500">
        {icon || (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-md">{message}</p>
      {action}
    </div>
  );
}
