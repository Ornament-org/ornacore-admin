import { CalendarDays, Download, Sparkles, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "../../../components/common/Badge.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { dashboardStats } from "../../../data/demoData.js";
import { env } from "../../../config/env.js";
import { dashboardService } from "../../../services/resourceServices.js";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { openAddCollectionModal } from "../../khatabook/store/khatabookSlice.js";
import { DueOverview } from "../components/DueOverview.jsx";
import { LowStockAlerts } from "../components/LowStockAlerts.jsx";
import { MetricCard } from "../components/MetricCard.jsx";
import { OrderStatusChart } from "../components/OrderStatusChart.jsx";
import { RecentOrders } from "../components/RecentOrders.jsx";
import { SalesOverview } from "../components/SalesOverview.jsx";
import { TopCategories } from "../components/TopCategories.jsx";
import "../Dashboard.scss";

const formatGrams = (value) => `${Number(value || 0).toLocaleString("en-IN", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})} gm`;

export function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const name = user?.roles?.includes("SUPER_ADMIN") ? "Super Admin" : "Administrator";
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);
  const [range, setRange] = useState({ startDate: "2026-05-20", endDate: "2026-06-20" });

  useEffect(() => {
    if (env.enableDemoData) return;
    let alive = true;
    dashboardService
      .list(range)
      .then((response) => {
        if (!alive) return;
        setDashboard(response.data);
        setError(null);
      })
      .catch((requestError) => {
        if (!alive) return;
        setError(apiErrorMessage(requestError));
      });
    return () => {
      alive = false;
    };
  }, [range]);

  const metrics = useMemo(() => {
    if (!dashboard)
      return env.enableDemoData
        ? dashboardStats
        : [
            { label: "Total Shopkeepers", value: "0", icon: "shopkeepers", tone: "purple" },
            { label: "Pending Approval", value: "0", icon: "pending", tone: "orange" },
            { label: "Total Orders", value: "0", icon: "orders", tone: "blue" },
            { label: "Total Sales (gm)", value: formatGrams(0), icon: "sales", tone: "green" },
            { label: "Total Due (gm)", value: formatGrams(0), icon: "due", tone: "red" },
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
        label: "Total Sales (gm)",
        value: formatGrams(dashboard.metrics.totalSales),
        icon: "sales",
        tone: "green",
      },
      {
        label: "Total Due (gm)",
        value: formatGrams(dashboard.metrics.totalDue),
        icon: "due",
        tone: "red",
      },
    ].map((metric) => ({ ...metric, delta: "Live", comparison: "current total" }));
  }, [dashboard]);

  return (
    <>
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
          <div className="dashboard-actions">
            <Badge tone={env.enableDemoData ? "warning" : "success"} dot>
              {env.enableDemoData ? "Preview data" : "Live data"}
            </Badge>
            <div className="date-range-control">
              <CalendarDays size={16} />
              <input
                aria-label="Dashboard start date"
                type="date"
                value={range.startDate}
                onChange={(event) =>
                  setRange((current) => ({ ...current, startDate: event.target.value }))
                }
              />
              <span>to</span>
              <input
                aria-label="Dashboard end date"
                type="date"
                value={range.endDate}
                onChange={(event) =>
                  setRange((current) => ({ ...current, endDate: event.target.value }))
                }
              />
            </div>
            <Button variant="secondary" icon={Download}>
              Export
            </Button>
            <Button icon={Wallet} onClick={() => dispatch(openAddCollectionModal())}>
              Add Collection
            </Button>
          </div>
        }
      />
      {error && <FormAlert>{error}</FormAlert>}
      <div className="metric-grid">
        {metrics.map((metric) => (
          <MetricCard metric={metric} key={metric.label} />
        ))}
      </div>
      <div className="dashboard-grid dashboard-grid--top">
        <SalesOverview
          data={dashboard?.salesTrend}
          metalTotals={dashboard?.salesByMetal}
          total={dashboard?.metrics?.totalSales}
        />
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
