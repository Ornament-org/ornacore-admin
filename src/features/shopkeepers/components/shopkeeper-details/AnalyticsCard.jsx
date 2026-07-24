import { AlertTriangle, CreditCard, Layers2 } from "lucide-react";
import "./AnalyticsCard.scss";

const CARD_CONFIG = {
  due:    { icon: AlertTriangle, accent: "#dc2626", bg: "#fff1f2", border: "#fecdd3" },
  credit: { icon: CreditCard,    accent: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
};

const fmt = (v) => Number(v ?? 0).toFixed(3);

export function AnalyticsCard({ type, title, total, unit = "gm", items = [] }) {
  const config = CARD_CONFIG[type] ?? CARD_CONFIG.due;
  const Icon   = config.icon;

  return (
    <div
      className={`analytics-card analytics-card--${type}`}
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
