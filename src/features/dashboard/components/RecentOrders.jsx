import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../../components/common/Badge.jsx";
import { Card } from "../../../components/common/Card.jsx";
import "../../../components/common/Avatar.scss";
import { recentOrders } from "../../../data/demoData.js";
import { formatCurrency } from "../../../utils/formatters.js";

export function RecentOrders({ data }) {
  const rows =
    data !== undefined
      ? data.map((order) => ({
          id: order.orderNumber,
          shop: order.shopkeeper?.shopName ?? "—",
          amount: formatCurrency(order.grandTotal),
          status: order.status,
          tone: ["DELIVERED", "CONFIRMED"].includes(order.status) ? "success" : "warning",
          initials: (order.shopkeeper?.shopName ?? "OR").slice(0, 2).toUpperCase(),
        }))
      : recentOrders;
  return (
    <Card className="dashboard-card">
      <div className="card-heading">
        <div>
          <h2>Recent Orders</h2>
          <p>Latest shopkeeper activity</p>
        </div>
        <Link className="text-link" to="/orders">
          View all <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="recent-orders">
        {rows.map((order) => (
          <div className="recent-order" key={order.id}>
            <span className="avatar avatar--soft">{order.initials}</span>
            <div className="recent-order__identity">
              <strong>{order.id}</strong>
              <span>{order.shop}</span>
            </div>
            <strong className="recent-order__amount">{order.amount}</strong>
            <Badge tone={order.tone}>{order.status}</Badge>
          </div>
        ))}
        {rows.length === 0 && <div className="dashboard-empty">No recent orders</div>}
      </div>
    </Card>
  );
}
