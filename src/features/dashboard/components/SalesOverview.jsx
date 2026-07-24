import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { salesTrend } from "../../../data/demoData.js";
import { Card } from "../../../components/common/Card.jsx";

const formatGrams = (value) => `${Number(value || 0).toLocaleString("en-IN", {
  maximumFractionDigits: 3,
})} gm`;

export function SalesOverview({ data, metalTotals, total }) {
  const chartData =
    data !== undefined
      ? data.map((item) => ({
          ...item,
          date: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(
            new Date(item.date),
          ),
        }))
      : salesTrend;
  return (
    <Card className="dashboard-card dashboard-card--wide">
      <div className="card-heading">
        <div>
          <h2>Sales Overview</h2>
          <p>Fine metal delivered in selected date range</p>
        </div>
        <span className="dashboard-chip">gm</span>
      </div>
      <div className="sales-overview__value">
        <strong>{formatGrams(total ?? 0)}</strong>
        <span>{data ? "Live" : "+24.6%"}</span>
        <small>{data ? "selected range" : "vs last month"}</small>
      </div>
      {metalTotals?.length > 0 && (
        <div className="sales-overview__metals">
          {metalTotals.map((metal) => (
            <span key={metal.name}>
              <b>{metal.name}</b>
              <strong>{formatGrams(metal.value)}</strong>
            </span>
          ))}
        </div>
      )}
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d39a37" stopOpacity={0.26} />
                <stop offset="95%" stopColor="#d39a37" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eee9df" strokeDasharray="3 4" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#87837c", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#87837c", fontSize: 11 }}
              tickFormatter={(value) => `${Number(value).toFixed(0)}g`}
            />
            <Tooltip
              cursor={{ stroke: "#d39a37", strokeDasharray: "4 4" }}
              formatter={(value) => [formatGrams(value), "Fine delivered"]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e7e0d3",
                boxShadow: "0 12px 30px rgba(31, 27, 20, .08)",
              }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#c88d2b"
              strokeWidth={2.2}
              fill="url(#salesFill)"
              activeDot={{ r: 4, fill: "#c88d2b", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
