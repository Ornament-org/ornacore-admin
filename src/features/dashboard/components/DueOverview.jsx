import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card } from "../../../components/common/Card.jsx";
import { dueAging } from "../../../data/demoData.js";

const colors = ["#d8a13d", "#bfc3c7", "#c78628", "#7f96ad"];
const formatGrams = (value) => `${Number(value || 0).toLocaleString("en-IN", {
  maximumFractionDigits: 3,
})} gm`;

export function DueOverview({ data, total }) {
  const rows =
    data !== undefined
      ? data.map((item, index) => ({ ...item, color: colors[index % colors.length] }))
      : dueAging;
  return (
    <Card className="dashboard-card">
      <div className="card-heading">
        <div>
          <h2>Due Amount Overview</h2>
          <p>Outstanding metal due across all shopkeepers</p>
        </div>
      </div>
      <div className="donut-layout">
        <div className="donut-chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie data={rows} dataKey="value" innerRadius={56} outerRadius={80} stroke="none">
                {rows.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-chart__center">
            <strong>{formatGrams(total ?? 0)}</strong>
            <span>All metals</span>
          </div>
        </div>
        <div className="chart-legend chart-legend--amounts">
          {rows.map((item) => (
            <div key={item.name}>
              <span className="chart-legend__swatch" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
              <strong>{formatGrams(item.value)}</strong>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
