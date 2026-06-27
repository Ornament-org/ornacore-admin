import { CreditCard, Layers2, Package, Truck, Wallet } from "lucide-react";
import "./AnalyticsCard.scss";

const CARD_CONFIG = {
  due:       { icon: Package,    accent: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  delivered: { icon: Truck,      accent: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  received:  { icon: Wallet,     accent: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
  credit:    { icon: CreditCard, accent: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
};

const fmt = (v) => Number(v ?? 0).toFixed(3);

export function AnalyticsCard({ type, title, total, unit = "gm", items = [] }) {
  const config = CARD_CONFIG[type] ?? CARD_CONFIG.due;
  const Icon   = config.icon;

  return (
    <div
      className="analytics-card"
      style={{ "--card-accent": config.accent, "--card-bg": config.bg, "--card-border": config.border }}
    >
      <div className="analytics-card__top">
        <div className="analytics-card__icon-wrap">
          <Icon size={20} />
        </div>
        <div className="analytics-card__header">
          <span className="analytics-card__title">{title}</span>
          <strong className="analytics-card__total">
            {fmt(total)} <em>{unit}</em>
          </strong>
        </div>
      </div>

      <div className="analytics-card__divider" />

      <ul className="analytics-card__items">
        {items.map((item) => (
          <li key={item.metalId} className="analytics-card__item">
            <span className="analytics-card__item-icon">
              <Layers2 size={13} />
            </span>
            <span className="analytics-card__item-label">
              {item.metalName} {title.replace("Total ", "").replace("Metal ", "").replace("Available ", "")}
            </span>
            <span className="analytics-card__item-value">
              {fmt(item.value)} {unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
