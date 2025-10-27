import { useState, useCallback } from "react";
import { chatApi } from "../services/api";
import { useAuth } from "../auth/AuthProvider";

export function useUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, refreshSession } = useAuth();

  const updateProfile = useCallback(
    async (profileData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await chatApi.updateProfile(profileData);
        // Refresh the session to get updated user data
        await refreshSession();
        return response;
      } catch (err) {
        setError(err.userMessage || err.message || "Failed to update profile");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshSession]
  );

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await chatApi.changePassword(
        currentPassword,
        newPassword
      );
      return response;
    } catch (err) {
      setError(err.userMessage || err.message || "Failed to change password");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await chatApi.getProfile();
      return response;
    } catch (err) {
      setError(err.userMessage || err.message || "Failed to fetch profile");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    updateProfile,
    changePassword,
    getProfile,
    clearError: () => setError(null),
  };
}
