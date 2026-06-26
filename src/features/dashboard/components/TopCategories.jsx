import { Card } from "../../../components/common/Card.jsx";
import { topCategories } from "../../../data/demoData.js";
import { formatCurrency } from "../../../utils/formatters.js";

export function TopCategories({ data }) {
  const max = Math.max(...(data ?? []).map((item) => item.amount), 1);
  const rows =
    data !== undefined
      ? data.map((item) => ({
          ...item,
          amountLabel: formatCurrency(item.amount),
          share: Math.round((item.amount / max) * 100),
        }))
      : topCategories.map((item) => ({ ...item, amountLabel: item.amount }));
  return (
    <Card className="dashboard-card">
      <div className="card-heading">
        <div>
          <h2>Top Selling Categories</h2>
          <p>Revenue share this month</p>
        </div>
        <select className="compact-select" defaultValue="month">
          <option value="month">This Month</option>
        </select>
      </div>
      <div className="category-bars">
        {rows.map((category) => (
          <div className="category-bar" key={category.name}>
            <span>{category.name}</span>
            <div className="category-bar__track">
              <span style={{ width: `${category.share * 2.6}%` }} />
            </div>
            <strong>{category.amountLabel}</strong>
            <small>{category.share}%</small>
          </div>
        ))}
        {rows.length === 0 && <div className="dashboard-empty">No sales by category yet</div>}
      </div>
    </Card>
  );
}
