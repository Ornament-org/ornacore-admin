import { Card } from "../../../components/common/Card.jsx";
import { topCategories } from "../../../data/demoData.js";

const formatGrams = (value) => `${Number(value || 0).toLocaleString("en-IN", {
  maximumFractionDigits: 3,
})} gm`;

export function TopCategories({ data }) {
  const max = Math.max(...(data ?? []).map((item) => Number(item.amount) || 0), 1);
  const rows =
    data !== undefined
      ? data.map((item) => ({
          ...item,
          amountLabel: formatGrams(item.amount),
          share: Math.round(((Number(item.amount) || 0) / max) * 100),
        }))
      : topCategories.map((item) => ({ ...item, amountLabel: item.amount }));
  return (
    <Card className="dashboard-card">
      <div className="card-heading">
        <div>
          <h2>Top Selling Categories</h2>
          <p>Fine weight and order movement by category</p>
        </div>
        <span className="dashboard-chip">Top 5</span>
      </div>
      <div className="category-bars">
        {rows.map((category) => (
          <div className="category-bar" key={category.name}>
            <span>
              <strong>{category.name}</strong>
              <small>{Number(category.quantity || 0).toLocaleString("en-IN")} pcs</small>
            </span>
            <div className="category-bar__track">
              <span style={{ width: `${Math.min(category.share, 100)}%` }} />
            </div>
            <b>{category.amountLabel}</b>
            <em>{category.share}%</em>
          </div>
        ))}
        {rows.length === 0 && <div className="dashboard-empty">No sales by category yet</div>}
      </div>
    </Card>
  );
}
