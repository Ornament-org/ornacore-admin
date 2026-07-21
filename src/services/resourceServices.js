import { apiClient } from "./apiClient.js";

const createResourceService = (basePath) => ({
  async list(params, config) {
    const { data } = await apiClient.get(basePath, { params, ...config });
    return data;
  },
  async get(id) {
    const { data } = await apiClient.get(`${basePath}/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await apiClient.post(basePath, payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`${basePath}/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await apiClient.delete(`${basePath}/${id}`);
    return data;
  },
});

export const shopkeeperService = {
  ...createResourceService("/admin/shopkeepers"),
  details: async (id) => {
    const { data } = await apiClient.get(`/admin/shopkeepers/${id}/details`);
    return data;
  },
  analytics: async (id) => {
    const { data } = await apiClient.get(`/admin/shopkeepers/${id}/analytics`);
    return data;
  },
  ordersSummary: async (id) => {
    const { data } = await apiClient.get(`/admin/shopkeepers/${id}/orders-summary`);
    return data;
  },
  ledgerSummary: async (id) => {
    const { data } = await apiClient.get(`/admin/shopkeepers/${id}/ledger-summary`);
    return data;
  },
  recentActivity: async (id) => {
    const { data } = await apiClient.get(`/admin/shopkeepers/${id}/recent-activity`);
    return data;
  },
  approve: (id, payload) => apiClient.post(`/admin/shopkeepers/${id}/approve`, payload),
  reject: (id, payload) => apiClient.post(`/admin/shopkeepers/${id}/reject`, payload),
  suspend: (id, payload) => apiClient.post(`/admin/shopkeepers/${id}/suspend`, payload),
  block: (id, payload) => apiClient.post(`/admin/shopkeepers/${id}/block`, payload),
  requestMoreInfo: (id, payload) =>
    apiClient.post(`/admin/shopkeepers/${id}/request-more-info`, payload),
};

export const staffService = {
  ...createResourceService("/admin/staff"),
  create: async (payload) => {
    const { data } = await apiClient.post("/admin/staff", payload, { timeout: 60000 });
    return data;
  },
  resetPassword: (id, payload) =>
    apiClient.post(`/admin/staff/${id}/reset-password`, payload, { timeout: 60000 }),
};
export const roleService = createResourceService("/admin/roles");
export const permissionService = createResourceService("/admin/permissions");
export const rbacService = {
  async roles() {
    const { data } = await apiClient.get("/admin/rbac/roles");
    return data;
  },
  async permissionsMatrix() {
    const { data } = await apiClient.get("/admin/rbac/permissions-matrix");
    return data;
  },
  async updateRolePermission(payload) {
    const { data } = await apiClient.put("/admin/rbac/role-permissions", payload);
    return data;
  },
};
export const metalService = createResourceService("/admin/metals");
export const metalRateService = {
  async list() {
    const { data } = await apiClient.get("/admin/metal-rates");
    return data;
  },
  async upsert(metalId, payload) {
    const { data } = await apiClient.put(`/admin/metal-rates/${metalId}`, payload);
    return data;
  },
  async syncBullions() {
    const { data } = await apiClient.post("/admin/metal-rates/sync/bullions");
    return data;
  },
};
export const homepageService = {
  async list(params = {}) {
    const { data } = await apiClient.get("/admin/homepages", { params });
    return data;
  },
  async get(id) {
    const { data } = await apiClient.get(`/admin/homepages/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await apiClient.post("/admin/homepages", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/admin/homepages/${id}`, payload);
    return data;
  },
  async addSection(id, payload) {
    const { data } = await apiClient.post(`/admin/homepages/${id}/sections`, payload);
    return data;
  },
  async updateSection(id, sectionId, payload) {
    const { data } = await apiClient.patch(`/admin/homepages/${id}/sections/${sectionId}`, payload);
    return data;
  },
  async removeSection(id, sectionId) {
    const { data } = await apiClient.delete(`/admin/homepages/${id}/sections/${sectionId}`);
    return data;
  },
  async duplicateSection(id, sectionId) {
    const { data } = await apiClient.post(`/admin/homepages/${id}/sections/${sectionId}/duplicate`);
    return data;
  },
  async reorderSections(id, order) {
    const { data } = await apiClient.put(`/admin/homepages/${id}/sections/reorder`, { order });
    return data;
  },
};
export const categoryService = {
  ...createResourceService("/admin/categories"),
  async tree(params = {}) {
    const { data } = await apiClient.get("/admin/categories/tree", { params });
    return data;
  },
};
export const productService = {
  ...createResourceService("/admin/products"),
  addImages: (id, payload) => apiClient.post(`/admin/products/${id}/images`, payload),
  removeImage: (id, imageId) => apiClient.delete(`/admin/products/${id}/images/${imageId}`),
};
export const collectionService = createResourceService("/admin/collections");
export const bannerPlaceholderService = createResourceService("/admin/banner-placeholders");
export const bannerService = {
  ...createResourceService("/admin/banners"),
  async reorder(order) {
    const { data } = await apiClient.put("/admin/banners/reorder", { order });
    return data;
  },
};
export const pricingService = createResourceService("/admin/pricing");
export const pricingRuleService = createResourceService("/admin/pricing/rules");
export const pricingOverrideService = createResourceService("/admin/pricing/overrides");
export const inventoryService = {
  ...createResourceService("/admin/inventory"),
  movements: createResourceService("/admin/inventory/movements"),
  adjust: (id, payload) => apiClient.post(`/admin/inventory/${id}/adjust`, payload),
  // Adjusts by product variant id — the Inventory row is created on first
  // use, so a variant that's never had stock counted can still be set
  // directly instead of needing a separate "initialize inventory" step.
  adjustByVariant: (variantId, payload) =>
    apiClient.post(`/admin/inventory/variant/${variantId}/adjust`, payload),
};
export const orderService = {
  ...createResourceService("/admin/orders"),
  updateStatus: (id, payload) => apiClient.post(`/admin/orders/${id}/status`, payload),
  assign: (id, payload) => apiClient.post(`/admin/orders/${id}/assign`, payload),
};
export const paymentService = {
  ...createResourceService("/admin/payments"),
  due: createResourceService("/admin/payments/due"),
  updateStatus: (id, payload) => apiClient.patch(`/admin/payments/${id}/status`, payload),
};
export const deliveryService = createResourceService("/admin/delivery");
export const reportService = {
  sales: createResourceService("/admin/reports/sales"),
  inventory: createResourceService("/admin/reports/inventory"),
  shopkeepers: createResourceService("/admin/reports/shopkeepers"),
  products: createResourceService("/admin/reports/products"),
  payments: createResourceService("/admin/reports/payments"),
  orders: createResourceService("/admin/reports/orders"),
};
export const auditLogService = createResourceService("/admin/audit-logs");
export const accountsLedgerService = createResourceService("/admin/accounts-ledger");

export const khatabookService = {
  summary: async (shopkeeperId) => {
    const { data } = await apiClient.get(`/admin/khatabook/shopkeeper/${shopkeeperId}`);
    return data;
  },
  metals: async (shopkeeperId) => {
    const { data } = await apiClient.get(`/admin/khatabook/shopkeeper/${shopkeeperId}/metals`);
    return data;
  },
  orders: async (shopkeeperId, params = {}) => {
    const { data } = await apiClient.get("/admin/khatabook/orders", {
      params: { shopkeeperId, ...params },
    });
    return data;
  },
  order: async (orderId) => {
    const { data } = await apiClient.get(`/admin/khatabook/orders/${orderId}`);
    return data;
  },
  orderLedger: async (orderId, params = {}) => {
    const { data } = await apiClient.get(`/admin/khatabook/order/${orderId}/ledger`, { params });
    return data;
  },
  ledger: async (shopkeeperId, params = {}) => {
    const { data } = await apiClient.get("/admin/khatabook/ledger", {
      params: { shopkeeperId, ...params },
      notification: false,
    });
    return data;
  },
  createOrder: (payload) => apiClient.post("/admin/khatabook/orders", payload),
  previewOrder: async (payload) => {
    const { data } = await apiClient.post("/admin/khatabook/orders/preview", payload, {
      notification: false,
    });
    return data;
  },
  addMetalCollection: (orderId, payload) =>
    apiClient.post(`/admin/khatabook/orders/${orderId}/gold-collection`, payload),
  addCashCollection: (orderId, payload) =>
    apiClient.post(`/admin/khatabook/orders/${orderId}/cash-collection`, payload),
  metalsSummary: async (shopkeeperId) => {
    const { data } = await apiClient.get("/admin/khatabook/metals-summary", {
      params: { shopkeeperId },
    });
    return data;
  },
  paymentPreview: async (shopkeeperId, metalId) => {
    const { data } = await apiClient.get(`/admin/khatabook/shopkeeper/${shopkeeperId}/payment-preview`, {
      params: { metalId },
    });
    return data;
  },
  createMetalCollection: (payload) =>
    apiClient.post("/admin/khatabook/collections/metal", payload),
  createCashCollection: (payload) =>
    apiClient.post("/admin/khatabook/collections/cash", payload),
};
export const analyticsService = {
  shopkeeperOverview: async (shopkeeperId, startDate, endDate) => {
    const { data } = await apiClient.get(
      `/admin/analytics/shopkeeper/${shopkeeperId}/overview`,
      { params: { startDate, endDate }, notification: false },
    );
    return data;
  },
};

export const dashboardService = createResourceService("/admin/reports/dashboard");

export const mediaService = {
  async upload(files, owner) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (owner) formData.append("owner", JSON.stringify(owner));
    const { data } = await apiClient.post("/admin/media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      notification: { success: false },
    });
    return data;
  },
  async list(params = {}) {
    const { data } = await apiClient.get("/admin/media", { params, notification: false });
    return data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/admin/media/${id}`, payload, { notification: false });
    return data;
  },
  async trash(id) {
    const { data } = await apiClient.delete(`/admin/media/${id}`, { notification: false });
    return data;
  },
  async restore(id) {
    const { data } = await apiClient.post(`/admin/media/${id}/restore`, null, { notification: false });
    return data;
  },
  async purge(id) {
    const { data } = await apiClient.delete(`/admin/media/${id}/purge`, { notification: false });
    return data;
  },
  async listFolders() {
    const { data } = await apiClient.get("/admin/media/folders", { notification: false });
    return data;
  },
  async createFolder(payload) {
    const { data } = await apiClient.post("/admin/media/folders", payload, { notification: false });
    return data;
  },
};

export const attributeService = {
  ...createResourceService("/admin/attributes"),
  addValue: async (attributeId, payload) => {
    const { data } = await apiClient.post(`/admin/attributes/${attributeId}/values`, payload);
    return data;
  },
  updateValue: async (attributeId, valueId, payload) => {
    const { data } = await apiClient.patch(
      `/admin/attributes/${attributeId}/values/${valueId}`,
      payload,
    );
    return data;
  },
  removeValue: async (attributeId, valueId) => {
    const { data } = await apiClient.delete(`/admin/attributes/${attributeId}/values/${valueId}`);
    return data;
  },
};

export const storeSettingsService = {
  async get() {
    const { data } = await apiClient.get("/admin/store-settings");
    return data;
  },
  async update(payload) {
    const { data } = await apiClient.put("/admin/store-settings", payload);
    return data;
  },
  async getBranding() {
    const { data } = await apiClient.get("/admin/store-settings/branding", { notification: false });
    return data;
  },
};

export const featureFlagService = {
  ...createResourceService("/admin/feature-flags"),
  stats: async () => {
    const { data } = await apiClient.get("/admin/feature-flags/stats");
    return data;
  },
  toggle: async (id) => {
    const { data } = await apiClient.post(`/admin/feature-flags/${id}/toggle`);
    return data;
  },
  auditTrail: async (id, params) => {
    const { data } = await apiClient.get(`/admin/feature-flags/${id}/audit`, { params });
    return data;
  },
  modules: async () => {
    const { data } = await apiClient.get("/admin/feature-flags/modules");
    return data;
  },
};
