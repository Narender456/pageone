import { apiClient, tokenManager } from "./api";

class AuthAPI {
  async login(credentials) {
    const response = await apiClient.post("/auth/login", credentials);

    if (response.success && response.data) {
      tokenManager.setTokens(response.data.token, response.data.refreshToken);
    }

    return response;
  }

  async register(userData) {
    const response = await apiClient.post("/auth/register", userData);

    if (response.success && response.data) {
      tokenManager.setTokens(response.data.token, response.data.refreshToken);
    }

    return response;
  }

  async logout() {
    const response = await apiClient.post("/auth/logout");
    tokenManager.clearTokens();
    return response;
  }

  async getMe() {
    return apiClient.get("/auth/me");
  }

  async updateProfile(data) {
    return apiClient.put("/auth/profile", data);
  }

  async changePassword(data) {
    return apiClient.put("/auth/change-password", data);
  }

  async forgotPassword(email) {
    return apiClient.post("/auth/forgot-password", { email });
  }

  async resetPassword(token, password) {
    const response = await apiClient.post("/auth/reset-password", { token, password });

    if (response.success && response.data) {
      tokenManager.setTokens(response.data.token, response.data.refreshToken);
    }

    return response;
  }

  async refreshToken() {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post("/auth/refresh-token", { refreshToken });

    if (response.success && response.data) {
      tokenManager.setTokens(response.data.token, response.data.refreshToken);
    }

    return response;
  }
}

export const authAPI = new AuthAPI();

