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
import { formatCurrency } from "../../../utils/formatters.js";
import { Card } from "../../../components/common/Card.jsx";

export function SalesOverview({ data, total }) {
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
          <p>Total sales this month</p>
        </div>
        <select className="compact-select" defaultValue="month">
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
        </select>
      </div>
      <div className="sales-overview__value">
        <strong>{formatCurrency(total ?? 24578000)}</strong>
        <span>{data ? "Live" : "+24.6%"}</span>
        <small>{data ? "current total" : "vs last month"}</small>
      </div>
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
              tickFormatter={(value) => `₹${Math.round(value / 100000)}L`}
            />
            <Tooltip
              cursor={{ stroke: "#d39a37", strokeDasharray: "4 4" }}
              formatter={(value) => [formatCurrency(value), "Sales"]}
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
