import { apiClient } from "./api";

export const pagesApi = {
  // Get all pages with filters
  async getPages(params) {
    const searchParams = new URLSearchParams();
    if (params?.study) searchParams.append("study", params.study);
    if (params?.site) searchParams.append("site", params.site);
    if (params?.page) searchParams.append("page", params.page.toString());

    const url = `/pages${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    return apiClient.get(url);
  },

  // Create new page
  async createPage(data) {
    return apiClient.post("/pages", data);
  },

  // Get single page
  async getPage(slug) {
    return apiClient.get(`/pages/${slug}`);
  },

  // Update page
  async updatePage(slug, data) {
    return apiClient.put(`/pages/${slug}`, data);
  },

  // Delete page
  async deletePage(slug) {
    return apiClient.delete(`/pages/${slug}`);
  },

  // Load page for viewing
  async loadPage(slug) {
    return apiClient.get(`/pages/load/${slug}`);
  },

  // View page with business logic
  async viewPage(slug) {
    return apiClient.get(`/pages/view/${slug}`);
  },

  // Save page content
  async savePage(data) {
    return apiClient.post("/pages/save", data);
  },

  // Phase transitions
  async moveToTesting(slug) {
    return apiClient.post(`/pages/move-to-testing/${slug}`);
  },

  async moveToMigrate(slug) {
    return apiClient.post(`/pages/move-to-migrate/${slug}`);
  },

  async moveToLive(slug) {
    return apiClient.post(`/pages/move-to-live/${slug}`);
  },

  async moveToDevelopment(slug) {
    return apiClient.post(`/pages/move-to-development/${slug}`);
  },

  async markTestingPassed(slug) {
    return apiClient.post(`/pages/mark-testing-passed/${slug}`);
  },

  // Page management
  async toggleFreezePage(slug) {
    return apiClient.post(`/pages/toggle-freeze/${slug}`);
  },

  // Utility functions
  async fetchShipments(studyId, siteId) {
    return apiClient.get(`/pages/fetch-shipments?study_id=${studyId}&site_id=${siteId}`);
  },

  // Fetch sites for selected studies
  async fetchSitesForStudies(studyIds) {
    const searchParams = new URLSearchParams();
    studyIds.forEach((id) => searchParams.append("study_ids", id));
    return apiClient.get(`/pages/fetch-sites-for-studies?${searchParams.toString()}`);
  },
};
