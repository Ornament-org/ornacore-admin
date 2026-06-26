import { CalendarDays, Download, Sparkles, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Badge } from "../../../components/common/Badge.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { dashboardStats } from "../../../data/demoData.js";
import { env } from "../../../config/env.js";
import { dashboardService } from "../../../services/resourceServices.js";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { formatCurrency } from "../../../utils/formatters.js";
import { AddCollectionModal } from "../../khatabook/collections/addCollection/AddCollectionModal.jsx";
import { DueOverview } from "../components/DueOverview.jsx";
import { LowStockAlerts } from "../components/LowStockAlerts.jsx";
import { MetricCard } from "../components/MetricCard.jsx";
import { OrderStatusChart } from "../components/OrderStatusChart.jsx";
import { RecentOrders } from "../components/RecentOrders.jsx";
import { SalesOverview } from "../components/SalesOverview.jsx";
import { TopCategories } from "../components/TopCategories.jsx";
import "../Dashboard.scss";

export function DashboardPage() {
  const user = useSelector((state) => state.auth.user);
  const name = user?.roles?.includes("SUPER_ADMIN") ? "Super Admin" : "Administrator";
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  useEffect(() => {
    if (env.enableDemoData) return;
    dashboardService
      .list()
      .then((response) => setDashboard(response.data))
      .catch((requestError) => setError(apiErrorMessage(requestError)));
  }, []);

  const metrics = useMemo(() => {
    if (!dashboard)
      return env.enableDemoData
        ? dashboardStats
        : [
            { label: "Total Shopkeepers", value: "0", icon: "shopkeepers", tone: "purple" },
            { label: "Pending Approval", value: "0", icon: "pending", tone: "orange" },
            { label: "Total Orders", value: "0", icon: "orders", tone: "blue" },
            { label: "Total Sales", value: formatCurrency(0), icon: "sales", tone: "green" },
            { label: "Total Due Amount", value: formatCurrency(0), icon: "due", tone: "red" },
          ].map((metric) => ({ ...metric, delta: "Live", comparison: "current total" }));
    return [
      {
        label: "Total Shopkeepers",
        value: dashboard.metrics.totalShopkeepers.toLocaleString("en-IN"),
        icon: "shopkeepers",
        tone: "purple",
      },
      {
        label: "Pending Approval",
        value: dashboard.metrics.pendingApproval.toLocaleString("en-IN"),
        icon: "pending",
        tone: "orange",
      },
      {
        label: "Total Orders",
        value: dashboard.metrics.totalOrders.toLocaleString("en-IN"),
        icon: "orders",
        tone: "blue",
      },
      {
        label: "Total Sales",
        value: formatCurrency(dashboard.metrics.totalSales),
        icon: "sales",
        tone: "green",
      },
      {
        label: "Total Due Amount",
        value: formatCurrency(dashboard.metrics.totalDue),
        icon: "due",
        tone: "red",
      },
    ].map((metric) => ({ ...metric, delta: "Live", comparison: "current total" }));
  }, [dashboard]);

  return (
    <>
    {collectionModalOpen && (
      <AddCollectionModal
        onClose={() => setCollectionModalOpen(false)}
        onSuccess={() => setCollectionModalOpen(false)}
      />
    )}
    <div className="page-stack">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description={
          <span className="dashboard-welcome">
            Welcome back, {name} <Sparkles size={14} />
          </span>
        }
        actions={
          <>
            <Badge tone={env.enableDemoData ? "warning" : "success"} dot>
              {env.enableDemoData ? "Preview data" : "Live data"}
            </Badge>
            <button className="date-button">
              <CalendarDays size={16} />
              20 May – 20 June, 2026
            </button>
            <Button variant="secondary" icon={Download}>
              Export
            </Button>
            <Button icon={Wallet} onClick={() => setCollectionModalOpen(true)}>
              Add Collection
            </Button>
          </>
        }
      />
      {error && <FormAlert>{error}</FormAlert>}
      <div className="metric-grid">
        {metrics.map((metric) => (
          <MetricCard metric={metric} key={metric.label} />
        ))}
      </div>
      <div className="dashboard-grid dashboard-grid--top">
        <SalesOverview data={dashboard?.salesTrend} total={dashboard?.metrics?.totalSales} />
        <OrderStatusChart data={dashboard?.orderStatus} />
        <RecentOrders data={dashboard?.recentOrders} />
      </div>
      <div className="dashboard-grid dashboard-grid--bottom">
        <TopCategories data={dashboard?.topCategories} />
        <DueOverview data={dashboard?.dueAging} total={dashboard?.metrics?.totalDue} />
        <LowStockAlerts data={dashboard?.lowStock} />
      </div>
    </div>
    </>
  );
}
