import { apiClient } from "./apiClient.js";

export const authService = {
  async login(credentials) {
    const { data } = await apiClient.post("/admin/auth/login", credentials);
    return data.data;
  },

  async googleLogin(payload) {
    const { data } = await apiClient.post("/admin/auth/google-login", payload, {
      notification: false,
    });
    return data.data;
  },

  async requestOtpLogin(payload) {
    const { data } = await apiClient.post("/admin/auth/otp-login/request", payload, {
      notification: { success: false },
    });
    return data.data;
  },

  async verifyOtpLogin(payload) {
    const { data } = await apiClient.post("/admin/auth/otp-login/verify", payload, {
      notification: false,
    });
    return data.data;
  },

  async me() {
    const { data } = await apiClient.get("/admin/auth/me");
    return data.data.user;
  },

  async refreshSession(refreshToken) {
    if (!refreshToken) return null;
    const { data } = await apiClient.post("/admin/auth/refresh", { refreshToken });
    return data.data;
  },

  async logout(refreshToken) {
    if (!refreshToken) return;
    await apiClient.post("/admin/auth/logout", { refreshToken });
  },

  async logoutAll() {
    await apiClient.post("/admin/auth/logout-all", {});
  },

  async changePassword(payload) {
    const { data } = await apiClient.post("/admin/auth/change-password", payload);
    return data;
  },
};
