import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card } from "../../../components/common/Card.jsx";
import { orderStatus } from "../../../data/demoData.js";

const colors = ["#dca13b", "#bc8425", "#e4ded1", "#69b6c4", "#3ca269", "#ef6358"];

export function OrderStatusChart({ data }) {
  const rows =
    data !== undefined
      ? data.map((item, index) => ({
          ...item,
          name: item.name.replaceAll("_", " "),
          color: colors[index % colors.length],
        }))
      : orderStatus;
  const total = rows.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="dashboard-card">
      <div className="card-heading">
        <div>
          <h2>Order Status</h2>
          <p>Current order distribution</p>
        </div>
      </div>
      <div className="donut-layout">
        <div className="donut-chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={rows}
                dataKey="value"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={0}
                stroke="none"
              >
                {rows.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-chart__center">
            <strong>{total.toLocaleString("en-IN")}</strong>
            <span>Total Orders</span>
          </div>
        </div>
        <div className="chart-legend">
          {rows.map((item) => (
            <div key={item.name}>
              <span className="chart-legend__swatch" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
              <strong>{item.value.toLocaleString("en-IN")}</strong>
            </div>
          ))}
          {rows.length === 0 && <span className="dashboard-empty">No orders yet</span>}
        </div>
      </div>
    </Card>
  );
}
