import { apiClient } from "./apiClient.js";

const createResourceService = (basePath) => ({
  async list(params) {
    const { data } = await apiClient.get(basePath, { params });
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
export const pricingService = createResourceService("/admin/pricing");
export const pricingRuleService = createResourceService("/admin/pricing/rules");
export const pricingOverrideService = createResourceService("/admin/pricing/overrides");
export const inventoryService = {
  ...createResourceService("/admin/inventory"),
  movements: createResourceService("/admin/inventory/movements"),
  adjust: (id, payload) => apiClient.post(`/admin/inventory/${id}/adjust`, payload),
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
};
