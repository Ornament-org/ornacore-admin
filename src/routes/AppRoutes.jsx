import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "../components/layout/AdminLayout.jsx";
import { PageLoader } from "../components/common/PageLoader.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

const loadNamed = (loader, exportName) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })));

const LoginPage = loadNamed(() => import("../features/auth/pages/LoginPage.jsx"), "LoginPage");
const ChangePasswordPage = loadNamed(
  () => import("../features/auth/pages/ChangePasswordPage.jsx"),
  "ChangePasswordPage",
);
const DashboardPage = loadNamed(
  () => import("../features/dashboard/pages/DashboardPage.jsx"),
  "DashboardPage",
);
const ShopkeepersPage = loadNamed(
  () => import("../features/shopkeepers/pages/ShopkeepersPage.jsx"),
  "ShopkeepersPage",
);
const ShopkeeperDetailsPage = loadNamed(
  () => import("../features/shopkeepers/pages/ShopkeeperDetailsPage.jsx"),
  "ShopkeeperDetailsPage",
);
const AddReceivedPaymentPage = loadNamed(
  () => import("../features/khatabook/pages/AddReceivedPaymentPage.jsx"),
  "AddReceivedPaymentPage",
);
const CatalogPage = loadNamed(
  () => import("../features/catalog/pages/CatalogPage.jsx"),
  "CatalogPage",
);
const ProductsPage = loadNamed(
  () => import("../features/products/pages/ProductsPage.jsx"),
  "ProductsPage",
);
const CreateProductPage = loadNamed(
  () => import("../features/products/pages/CreateProductPage.jsx"),
  "CreateProductPage",
);
const PricingPage = loadNamed(
  () => import("../features/pricing/pages/PricingPage.jsx"),
  "PricingPage",
);
const InventoryPage = loadNamed(
  () => import("../features/inventory/pages/InventoryPage.jsx"),
  "InventoryPage",
);
const OrdersPage = loadNamed(() => import("../features/orders/pages/OrdersPage.jsx"), "OrdersPage");
const PaymentsPage = loadNamed(
  () => import("../features/payments/pages/PaymentsPage.jsx"),
  "PaymentsPage",
);
const StaffPage = loadNamed(() => import("../features/staff/pages/StaffPage.jsx"), "StaffPage");
const RolesPermissionsPage = loadNamed(
  () => import("../features/rbac/pages/RolesPermissionsPage.jsx"),
  "RolesPermissionsPage",
);
const ReportsPage = loadNamed(
  () => import("../features/reports/pages/ReportsPage.jsx"),
  "ReportsPage",
);
const AuditLogsPage = loadNamed(
  () => import("../features/audit-logs/pages/AuditLogsPage.jsx"),
  "AuditLogsPage",
);
const SettingsPage = loadNamed(
  () => import("../features/settings/pages/SettingsPage.jsx"),
  "SettingsPage",
);
const FeatureFlagsPage = loadNamed(
  () => import("../features/settings/pages/FeatureFlagsPage.jsx"),
  "FeatureFlagsPage",
);
const AttributesPage = loadNamed(
  () => import("../features/catalog/pages/AttributesPage.jsx"),
  "AttributesPage",
);

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/shopkeepers" element={<ShopkeepersPage />} />
            <Route path="/shopkeepers/:id" element={<ShopkeeperDetailsPage />} />
            <Route path="/shopkeepers/:shopkeeperId/payment" element={<AddReceivedPaymentPage />} />
            <Route
              path="/shopkeepers/pending"
              element={<ShopkeepersPage title="Pending Approval" />}
            />
            <Route
              path="/shopkeepers/approved"
              element={<ShopkeepersPage title="Approved Shopkeepers" />}
            />
            <Route
              path="/shopkeepers/rejected"
              element={<ShopkeepersPage title="Rejected Shopkeepers" />}
            />
            <Route
              path="/shopkeepers/suspended"
              element={<ShopkeepersPage title="Suspended Shopkeepers" />}
            />

            <Route path="/catalog/metals" element={<CatalogPage title="Metals" />} />
            <Route path="/catalog/categories" element={<CatalogPage title="Categories" />} />
            <Route
              path="/catalog/subcategories"
              element={<Navigate to="/catalog/categories" replace />}
            />
            <Route path="/catalog/collections" element={<CatalogPage title="Collections" />} />
            <Route path="/catalog/banners" element={<CatalogPage title="Banners" />} />
            <Route path="/catalog/attributes" element={<AttributesPage />} />

            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/create" element={<CreateProductPage />} />
            <Route path="/products/:id/edit" element={<CreateProductPage />} />
            <Route path="/products/draft" element={<ProductsPage title="Draft Products" />} />
            <Route
              path="/products/out-of-stock"
              element={<ProductsPage title="Out of Stock Products" />}
            />

            <Route path="/pricing/groups" element={<Navigate to="/pricing/products" replace />} />
            <Route path="/pricing/products" element={<PricingPage title="Product Pricing" />} />
            <Route
              path="/pricing/shopkeepers"
              element={<PricingPage title="Shopkeeper Pricing" />}
            />
            <Route path="/pricing/bulk" element={<PricingPage title="Bulk Pricing" />} />

            <Route path="/inventory" element={<InventoryPage />} />
            <Route
              path="/inventory/movements"
              element={<InventoryPage title="Stock Movements" />}
            />
            <Route
              path="/inventory/adjustment"
              element={<InventoryPage title="Stock Adjustment" />}
            />

            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/requested" element={<OrdersPage title="Requested Orders" />} />
            <Route path="/orders/confirmed" element={<OrdersPage title="Confirmed Orders" />} />
            <Route path="/orders/packed" element={<OrdersPage title="Packed Orders" />} />
            <Route path="/orders/dispatched" element={<OrdersPage title="Dispatched Orders" />} />
            <Route path="/orders/delivered" element={<OrdersPage title="Delivered Orders" />} />
            <Route path="/orders/cancelled" element={<OrdersPage title="Cancelled Orders" />} />

            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/payments/due" element={<PaymentsPage title="Due Amounts" />} />
            <Route
              path="/payments/collections"
              element={<PaymentsPage title="Cash Collection" />}
            />
            <Route path="/payments/credit" element={<PaymentsPage title="Credit Orders" />} />

            <Route path="/staff" element={<StaffPage />} />
            <Route path="/staff/roles" element={<RolesPermissionsPage />} />
            <Route path="/roles-permissions" element={<RolesPermissionsPage />} />

            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:reportType" element={<ReportsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/feature-flags" element={<FeatureFlagsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
