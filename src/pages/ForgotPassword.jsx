// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "../components/LoadingStates";
import { chatApi } from "../services/api";

const PAGE_BG = "bg-[#151a1e]";
const CARD_BG = "bg-[#1d2328]";
const BORDER = "border border-[#293239]";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await chatApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        className={`min-h-screen ${PAGE_BG} text-gray-100 flex items-center justify-center px-4`}
      >
        <div
          className={`w-full max-w-md ${CARD_BG} ${BORDER} rounded-lg shadow-lg p-8`}
        >
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-100 mb-2">
              Check your email
            </h1>
            <p className="text-sm text-gray-400 mb-4">
              We've sent password reset instructions to
            </p>
            <p className="text-sm font-medium text-blue-400 bg-blue-900/20 rounded-lg px-3 py-2 border border-blue-800/30">
              {email}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-amber-300 mb-1">
                    Important
                  </h4>
                  <p className="text-xs text-amber-200">
                    The reset link will expire in 24 hours. Check your spam
                    folder if you don't see the email.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSent(false);
                setEmail("");
                setError("");
              }}
              className="w-full h-12 rounded-lg bg-[#1a2126] border border-[#293239] text-gray-200 hover:bg-white/5 transition-all duration-200 font-medium"
            >
              Send another email
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors inline-flex items-center gap-1"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${PAGE_BG} text-gray-100 flex items-center justify-center px-4`}
    >
      <div
        className={`w-full max-w-md ${CARD_BG} ${BORDER} rounded-lg shadow-lg p-8`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-400/20 grid place-items-center shadow-lg">
            <span className="text-lg font-bold text-white">∞</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Reset password
          </h1>
          <p className="text-sm text-gray-400">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 h-12 rounded-lg bg-[#151a1e] border border-[#293239] text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              placeholder="grace@company.com"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-3 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-300">Error</h4>
                <p className="text-sm text-red-200 mt-1">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className={`w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 flex items-center justify-center gap-2`}
          >
            {loading && <Spinner size="sm" />}
            {loading ? "Sending..." : "Send reset instructions"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-sm text-gray-400 hover:text-gray-200 transition-colors inline-flex items-center gap-1"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to sign in
          </Link>
        </div>

        {/* Help text */}
        <div className="mt-6 p-4 bg-gray-900/30 border border-gray-700/50 rounded-lg">
          <div className="text-xs text-gray-400">
            <div className="font-medium text-gray-300 mb-2">Need help?</div>
            <p>
              Contact your administrator if you're having trouble accessing your
              account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
