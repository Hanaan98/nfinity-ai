// src/components/ProductRecommendation.jsx
import React from "react";

export default function ProductRecommendation({ content }) {
  // Handle different content formats
  if (typeof content === "string") {
    try {
      content = JSON.parse(content);
    } catch {
      return <div className="text-gray-300">{content}</div>;
    }
  }

  if (!content.payload || !content.payload.products) {
    return (
      <div className="text-gray-300">
        {content.message || "Product recommendation"}
      </div>
    );
  }

  const { message, payload } = content;
  const { products } = payload;

  return (
    <div className="space-y-3">
      {/* Message */}
      {message && <p className="text-gray-100 mb-4">{message}</p>}

      {/* Products */}
      <div className="space-y-3">
        {products.map((product, index) => (
          <div
            key={product.id || index}
            className="bg-[#0f1a20] border border-[#293239] rounded-lg p-4 hover:border-[#3d4a52] transition-colors"
          >
            <div className="flex gap-4">
              {/* Product Image */}
              {product.image && (
                <div className="flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded-lg bg-gray-800"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-gray-100 text-sm leading-snug">
                    {product.title}
                  </h4>
                  <span className="text-green-400 font-medium text-sm shrink-0">
                    {product.price}
                  </span>
                </div>

                {/* Available Sizes */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">
                      Available sizes:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {product.variants.slice(0, 8).map((variant, idx) => (
                        <span
                          key={variant.id || idx}
                          className={`px-2 py-1 text-xs rounded border ${
                            variant.available
                              ? "bg-[#1d2328] border-[#293239] text-gray-300 hover:border-[#3d4a52]"
                              : "bg-gray-800/50 border-gray-700 text-gray-500"
                          }`}
                        >
                          {variant.title}
                        </span>
                      ))}
                      {product.variants.length > 8 && (
                        <span className="px-2 py-1 text-xs text-gray-400">
                          +{product.variants.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Product Link */}
                {product.url && (
                  <div className="mt-3">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      View Product
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M7 17L17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Meta Info */}
      {payload.meta && payload.meta.has_next && (
        <div className="text-center pt-2">
          <span className="text-xs text-gray-500">
            More products available...
          </span>
        </div>
      )}
    </div>
  );
}
