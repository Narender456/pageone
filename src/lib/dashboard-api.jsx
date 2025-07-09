import { apiClient } from "./api";

class DashboardAPI {
  async getStats() {
    return apiClient.get("/dashboard/stats");
  }

  async getRecentActivity(limit = 10) {
    return apiClient.get(`/dashboard/activity?limit=${limit}`);
  }
}

export const dashboardAPI = new DashboardAPI();

