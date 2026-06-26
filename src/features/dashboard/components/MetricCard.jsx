import {
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardList,
  Store,
  UserRoundCheck,
} from "lucide-react";
import clsx from "clsx";

const icons = {
  shopkeepers: Store,
  pending: UserRoundCheck,
  orders: ClipboardList,
  sales: ChartNoAxesCombined,
  due: CircleDollarSign,
};

export function MetricCard({ metric }) {
  const Icon = icons[metric.icon];
  const isPositive = metric.delta.startsWith("+") || metric.delta === "Live";

  return (
    <article className="metric-card">
      <div>
        <span className="metric-card__label">{metric.label}</span>
        <strong
          className={`metric-card__value ${
            metric.value.length > 10 ? "metric-card__value--compact" : ""
          }`}
        >
          {metric.value}
        </strong>
        <div className="metric-card__trend">
          <span className={clsx(isPositive ? "trend-positive" : "trend-negative")}>
            {metric.delta}
          </span>
          <small>{metric.comparison}</small>
        </div>
      </div>
      <span className={clsx("metric-card__icon", `metric-card__icon--${metric.tone}`)}>
        <Icon size={24} />
      </span>
    </article>
  );
}
