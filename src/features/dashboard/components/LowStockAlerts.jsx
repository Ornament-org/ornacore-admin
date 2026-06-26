import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/common/Card.jsx";
import { lowStockItems } from "../../../data/demoData.js";

export function LowStockAlerts({ data }) {
  const rows =
    data !== undefined
      ? data.map((item) => ({
          name: `${item.variant?.product?.name ?? "Product"} ${item.variant?.sku ?? ""}`,
          stock: item.onHandQuantity,
          metal: (item.variant?.product?.metal?.name ?? "G").slice(0, 1),
        }))
      : lowStockItems;
  return (
    <Card className="dashboard-card">
      <div className="card-heading">
        <div>
          <h2>Low Stock Alerts</h2>
          <p>Items requiring attention</p>
        </div>
        <Link className="text-link" to="/inventory">
          View all <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="stock-alerts">
        {rows.map((item) => (
          <div className="stock-alert" key={item.name}>
            <span className={`metal-dot metal-dot--${item.metal.toLowerCase()}`}>{item.metal}</span>
            <span>{item.name}</span>
            <strong>Stock: {item.stock}</strong>
          </div>
        ))}
        {rows.length === 0 && <div className="dashboard-empty">Stock levels are healthy</div>}
      </div>
    </Card>
  );
}
