// src/auth/AuthProvider.jsx
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authClient } from "./authClient";
import { chatApi, getAccessToken, clearTokens } from "../services/api";
import { notificationService } from "../services/notificationService";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { token, user } | null
  const [status, setStatus] = useState("loading"); // loading | authed | anon
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Define signOut function with useCallback to prevent re-renders
  const signOut = useCallback(() => {
    try {
      authClient.logout();
      clearTokens();
      // Disconnect notification service
      notificationService.disconnect();
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      setSession(null);
      setStatus("anon");
    }
  }, []);

  // Track user activity for idle timeout
  useEffect(() => {
    const activities = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const resetTimer = () => setLastActivity(Date.now());

    activities.forEach((activity) => {
      document.addEventListener(activity, resetTimer, true);
    });

    return () => {
      activities.forEach((activity) => {
        document.removeEventListener(activity, resetTimer, true);
      });
    };
  }, []);

  // Check for idle timeout (30 minutes of inactivity)
  useEffect(() => {
    if (status === "authed") {
      const idleCheckInterval = setInterval(() => {
        const now = Date.now();
        const idleTime = now - lastActivity;
        const maxIdleTime = 30 * 60 * 1000; // 30 minutes

        if (idleTime > maxIdleTime) {
          console.warn("Session timed out due to inactivity");
          signOut();
        }
      }, 60000); // Check every minute

      return () => clearInterval(idleCheckInterval);
    }
  }, [status, lastActivity, signOut]);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔄 Initializing auth...");
      try {
        const storedSession = authClient.getSession();
        console.log("📦 Stored session:", storedSession);

        if (storedSession && storedSession.token) {
          console.log("🔑 Found stored token, verifying...");
          // Sync tokens with api.js if they exist in the session
          if (storedSession.accessToken && storedSession.refreshToken) {
            const { setTokens } = await import("../services/api");
            setTokens({
              accessToken: storedSession.accessToken,
              refreshToken: storedSession.refreshToken,
            });
            console.log("🔄 Tokens synced with API service");
          }

          // Verify the token is still valid by checking the profile
          try {
            console.log("👤 Verifying token with profile check...");
            const profile = await chatApi.getProfile();
            console.log("✅ Profile verified:", profile);
            setSession({
              ...storedSession,
              user: profile.user || storedSession.user,
            });
            setStatus("authed");

            // Connect to notification service with stored token
            if (storedSession.token) {
              notificationService.connect(storedSession.token);
            }

            console.log("✅ Auth status set to 'authed'");
          } catch (error) {
            // Token is invalid, clear it
            console.warn(
              "❌ Stored token is invalid, clearing session:",
              error
            );
            authClient.logout();
            clearTokens();
            setSession(null);
            setStatus("anon");
          }
        } else {
          console.log("📭 No stored session found");
          setSession(null);
          setStatus("anon");
        }
      } catch (error) {
        console.error("💥 Auth initialization error:", error);
        setSession(null);
        setStatus("anon");
      }
    };

    initializeAuth();
  }, []);

  // Monitor token changes and validate periodically
  useEffect(() => {
    if (status === "authed" && session) {
      // Set up periodic token validation (every 5 minutes)
      const validationInterval = setInterval(async () => {
        try {
          const token = getAccessToken();
          if (!token) {
            throw new Error("No access token found");
          }

          // Quick validation - try to get profile
          await chatApi.getProfile();
        } catch (error) {
          console.warn("Token validation failed, logging out", error);
          signOut();
        }
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(validationInterval);
    }
  }, [status, session, signOut]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      token: session?.token || null,
      status,
      isAuthenticated: status === "authed" && !!session?.user,
      isLoading: status === "loading",

      async signIn(creds) {
        try {
          console.log("🔐 Starting sign in process...", { email: creds.email });
          setStatus("loading");

          const s = await authClient.login(creds);
          console.log("✅ Login successful, session received:", s);
          console.log("👤 User data:", s.user);
          console.log("🔑 Token:", s.token ? "Present" : "Missing");

          setSession(s);
          setStatus("authed");
          setLastActivity(Date.now()); // Reset activity timer on login

          // Connect to notification service with new token
          if (s.token) {
            notificationService.connect(s.token);
          }

          console.log("✅ Auth state updated - status: 'authed', session set");
          return s;
        } catch (error) {
          console.error("❌ Login failed:", error);
          setStatus("anon");
          throw error;
        }
      },

      signOut,

      // Refresh session data
      async refreshSession() {
        if (status === "authed") {
          try {
            const profile = await chatApi.getProfile();
            setSession((prev) => ({
              ...prev,
              user: profile.user,
            }));
          } catch (error) {
            console.error("Failed to refresh session:", error);
            signOut();
          }
        }
      },
    }),
    [session, status, signOut]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
