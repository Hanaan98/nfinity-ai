// src/pages/Login.jsx
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Spinner } from "../components/LoadingStates";

const PAGE_BG = "bg-[#151a1e]";
const CARD_BG = "bg-[#1d2328]";
const BORDER = "border border-[#293239]";

export default function Login() {
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  // Enhanced error message mapping for better UX
  const getErrorMessage = (error) => {
    if (!error) return null;

    const message = error.message || error.toString();
    const status = error.status;

    // Map common HTTP status codes to user-friendly messages
    switch (status) {
      case 401:
        return {
          title: "Authentication Failed",
          message:
            "Invalid email or password. Please check your credentials and try again.",
          type: "auth",
        };
      case 403:
        return {
          title: "Access Denied",
          message:
            "Your account does not have permission to access this dashboard.",
          type: "permission",
        };
      case 429:
        return {
          title: "Too Many Attempts",
          message:
            "Too many login attempts. Please wait a few minutes before trying again.",
          type: "rate-limit",
        };
      case 500:
      case 502:
      case 503:
        return {
          title: "Service Unavailable",
          message:
            "Our servers are temporarily unavailable. Please try again in a few moments.",
          type: "server",
        };
      case 0:
        return {
          title: "Connection Error",
          message:
            "Unable to connect to our servers. Please check your internet connection and try again.",
          type: "network",
        };
      default:
        // Handle specific error messages
        if (
          message.toLowerCase().includes("invalid") ||
          message.toLowerCase().includes("incorrect")
        ) {
          return {
            title: "Invalid Credentials",
            message:
              "The email or password you entered is incorrect. Please try again.",
            type: "auth",
          };
        }
        if (
          message.toLowerCase().includes("network") ||
          message.toLowerCase().includes("connection")
        ) {
          return {
            title: "Connection Error",
            message:
              "Network connection failed. Please check your internet connection and try again.",
            type: "network",
          };
        }
        if (
          message.toLowerCase().includes("rate limit") ||
          message.toLowerCase().includes("too many")
        ) {
          return {
            title: "Too Many Attempts",
            message:
              "Too many login attempts. Please wait a few minutes before trying again.",
            type: "rate-limit",
          };
        }
        return {
          title: "Sign In Failed",
          message:
            "An unexpected error occurred. Please try again or contact support if the problem persists.",
          type: "general",
        };
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("Attempting login with:", { email, from });
      await signIn({ email, password: pw });
      console.log("Login successful, navigating to:", from);
      navigate(from, { replace: true });
    } catch (ex) {
      console.error("Login error:", ex);
      setError(ex);
    } finally {
      setLoading(false);
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div
      className={`min-h-screen ${PAGE_BG} text-gray-100 flex items-center justify-center px-4`}
    >
      <div
        className={`w-full max-w-md ${CARD_BG} ${BORDER} rounded-lg shadow-lg p-8`}
      >
        {/* Company Logo/Brand */}
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-400/20 grid place-items-center shadow-lg">
            <span className="text-lg font-bold text-white">∞</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-gray-400">
            Sign in to your admin dashboard
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
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="block w-full px-4 h-12 pr-12 rounded-lg bg-[#151a1e] border border-[#293239] text-gray-200 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {errorInfo && (
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {errorInfo.type === "rate-limit" ? (
                    <svg
                      className="w-5 h-5 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  ) : errorInfo.type === "network" ? (
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                      />
                    </svg>
                  ) : errorInfo.type === "server" ? (
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-red-400"
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
                  )}
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-sm font-medium mb-1 ${
                      errorInfo.type === "rate-limit"
                        ? "text-yellow-300"
                        : "text-red-300"
                    }`}
                  >
                    {errorInfo.title}
                  </h4>
                  <p
                    className={`text-sm ${
                      errorInfo.type === "rate-limit"
                        ? "text-yellow-200"
                        : "text-red-200"
                    }`}
                  >
                    {errorInfo.message}
                  </p>
                  {errorInfo.type === "rate-limit" && (
                    <div className="mt-3 p-2 bg-yellow-900/20 rounded border border-yellow-800/30">
                      <p className="text-xs text-yellow-200">
                        <strong>Troubleshooting tips:</strong>
                      </p>
                      <ul className="text-xs text-yellow-200 mt-1 space-y-1">
                        <li>• Wait 5-10 minutes before trying again</li>
                        <li>
                          • Try using a different browser or incognito mode
                        </li>
                        <li>
                          • Contact your system administrator if this persists
                        </li>
                      </ul>
                    </div>
                  )}
                  {(errorInfo.type === "network" ||
                    errorInfo.type === "server") && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          window.location.reload();
                        }}
                        className="text-xs text-red-300 hover:text-red-200 underline"
                      >
                        Refresh page and try again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !pw}
            className={`w-full h-12 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              loading ? "opacity-90" : ""
            }`}
          >
            {loading && <Spinner size="sm" />}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Security notice */}
        <div className="mt-8 p-3 bg-gray-900/30 border border-gray-700/50 rounded-lg">
          <div className="text-xs text-gray-400 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <svg
                className="w-3 h-3 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="font-medium text-gray-300">Secure Access</span>
            </div>
            <p>Your connection is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
