// src/auth/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Spinner } from "../components/LoadingStates";

export default function RequireAuth({ children }) {
  const { status, user, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log(
    "RequireAuth - status:",
    status,
    "user:",
    user,
    "isAuthenticated:",
    isAuthenticated,
    "location:",
    location.pathname
  );

  // Show enterprise loading screen while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#151a1e] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          {/* Company Logo */}
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-400/20 grid place-items-center shadow-lg">
              <span className="text-lg font-bold text-white">∞</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <Spinner size="sm" />
            <span className="text-lg font-medium text-gray-200">
              Authenticating...
            </span>
          </div>

          <p className="text-sm text-gray-400">Verifying your credentials</p>

          {/* Security indicators */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg
                className="w-3 h-3 text-green-400"
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
              Secure
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="w-3 h-3 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Encrypted
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === "anon" || !user) {
    console.log("🚫 Not authenticated - redirecting to login", {
      status,
      user: user ? "Present" : "Missing",
      from: location.pathname,
    });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // User is authenticated, render protected content
  console.log("✅ User authenticated - rendering protected content");
  return children;
}
