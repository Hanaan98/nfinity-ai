// src/components/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = ({ size = "md", color = "blue" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colorClasses = {
    blue: "border-blue-500",
    white: "border-white",
    gray: "border-gray-400",
    green: "border-green-500",
    red: "border-red-500",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
