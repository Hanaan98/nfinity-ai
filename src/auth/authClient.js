import { chatApi, setTokens, clearTokens } from "../services/api";

const STORAGE_KEY = "app.auth";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // Sync tokens with api.js token storage
  if (data?.accessToken && data?.refreshToken) {
    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }
}

export const authClient = {
  getSession() {
    return load();
  },

  async login({ email, password }) {
    try {
      const response = await chatApi.signIn({ email, password });

      const session = {
        token: response.accessToken,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      };

      save(session);
      return session;
    } catch (error) {
      throw new Error(error.message || "Login failed");
    }
  },

  async logout() {
    try {
      await chatApi.logout();
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      clearTokens(); // Also clear api.js tokens
    }
  },
};

export default authClient;
