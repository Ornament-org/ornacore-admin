import clsx from "clsx";
import "./StatCard.scss";

export function StatCard({ title, value, subtitle, icon: Icon, type }) {
  return (
    <div className={clsx("stat-card", type && `stat-card--${type}`)}>
      <div className="stat-card__body">
        <p className="stat-card__title">{title}</p>
        <strong className="stat-card__value">
          {(value ?? 0).toLocaleString("en-IN")}
        </strong>
        <span className="stat-card__subtitle">{subtitle}</span>
      </div>
      {Icon && (
        <div className={clsx("stat-card__icon", type && `stat-card__icon--${type}`)}>
          <Icon size={18} />
        </div>
      )}
    </div>
  );
}
