import {
  Boxes,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardList,
  Flag,
  Gem,
  LayoutDashboard,
  LayoutTemplate,
  PackageSearch,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
  Warehouse,
} from "lucide-react";

export const navigationGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }],
  },
  {
    label: "Business",
    items: [
      {
        label: "Shopkeepers",
        icon: Store,
        path: "/shopkeepers",
        children: [
          { label: "All Shopkeepers", path: "/shopkeepers" },
          { label: "Pending Approval", path: "/shopkeepers/pending" },
          { label: "Approved", path: "/shopkeepers/approved" },
          { label: "Rejected", path: "/shopkeepers/rejected" },
          { label: "Suspended", path: "/shopkeepers/suspended" },
        ],
      },
      {
        label: "Catalog",
        icon: Gem,
        path: "/catalog/metals",
        children: [
          { label: "Metals", path: "/catalog/metals" },
          { label: "Metal Rates", path: "/catalog/metal-rates" },
          { label: "Categories", path: "/catalog/categories" },
          { label: "Attributes", path: "/catalog/attributes" },
          { label: "Collections", path: "/catalog/collections" },
          { label: "Banners", path: "/catalog/banners" },
        ],
      },
      {
        label: "Products",
        icon: ShoppingBag,
        path: "/products",
        children: [
          { label: "All Products", path: "/products" },
          { label: "Create Product", path: "/products/create" },
          { label: "Draft Products", path: "/products/draft" },
          { label: "Out of Stock", path: "/products/out-of-stock" },
        ],
      },
      {
        label: "Pricing",
        icon: CircleDollarSign,
        path: "/pricing/products",
        children: [
          { label: "Product Pricing", path: "/pricing/products" },
          { label: "Shopkeeper Pricing", path: "/pricing/shopkeepers" },
          { label: "Bulk Pricing", path: "/pricing/bulk" },
        ],
      },
      {
        label: "Inventory",
        icon: Warehouse,
        path: "/inventory",
        children: [
          { label: "Stock Overview", path: "/inventory" },
          { label: "Stock Movements", path: "/inventory/movements" },
          { label: "Stock Adjustment", path: "/inventory/adjustment" },
        ],
      },
      {
        label: "Orders",
        icon: ClipboardList,
        path: "/orders",
        children: [
          { label: "All Orders", path: "/orders" },
          { label: "Requested", path: "/orders/requested" },
          { label: "Confirmed", path: "/orders/confirmed" },
          { label: "Packed", path: "/orders/packed" },
          { label: "Dispatched", path: "/orders/dispatched" },
          { label: "Delivered", path: "/orders/delivered" },
          { label: "Cancelled", path: "/orders/cancelled" },
        ],
      },
      {
        label: "Payments",
        icon: CircleDollarSign,
        path: "/payments",
        children: [
          { label: "Payment Records", path: "/payments" },
          { label: "Due Amounts", path: "/payments/due" },
          { label: "Cash Collection", path: "/payments/collections" },
          { label: "Credit Orders", path: "/payments/credit" },
        ],
      },
    ],
  },
  {
    label: "CMS",
    items: [
      {
        label: "Homepage Management",
        icon: LayoutTemplate,
        path: "/cms/homepage",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Staff",
        icon: Users,
        path: "/staff",
        children: [
          { label: "Staff Users", path: "/staff" },
          { label: "Roles & Permissions", path: "/staff/roles" },
        ],
      },
      {
        label: "Reports",
        icon: ChartNoAxesCombined,
        path: "/reports",
        children: [
          { label: "Sales Report", path: "/reports/sales" },
          { label: "Shopkeeper Report", path: "/reports/shopkeepers" },
          { label: "Product Report", path: "/reports/products" },
          { label: "Inventory Report", path: "/reports/inventory" },
          { label: "Payment Report", path: "/reports/payments" },
        ],
      },
      { label: "Audit Logs", icon: ScrollText, path: "/audit-logs" },
      { label: "Feature Flags", icon: Flag, path: "/settings/feature-flags" },
      { label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

export const quickRailItems = [LayoutDashboard, Store, ShieldCheck, PackageSearch, Boxes, Users];
