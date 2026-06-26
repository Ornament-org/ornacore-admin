import { PackageCheck } from "lucide-react";
import { AnalyticsCard } from "./DetailRows.jsx";

export function OrderStatsCard({ orders }) {
  return (
    <AnalyticsCard
      icon={PackageCheck}
      title="Order Analytics"
      rows={[
        ["Total Orders", orders?.totalOrders],
        ["Delivered Orders", orders?.deliveredOrders],
        ["Pending Orders", orders?.pendingOrders],
        ["Cancelled Orders", orders?.cancelledOrders],
      ]}
    />
  );
}
