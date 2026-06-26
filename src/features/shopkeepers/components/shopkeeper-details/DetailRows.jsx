export function DetailRowsCard({ icon: Icon, title, rows }) {
  return (
    <div className="sd-info-card">
      <div className="sd-info-card__header">
        {Icon && (
          <div className="sd-info-card__icon">
            <Icon size={18} />
          </div>
        )}
        <h2 className="sd-info-card__title">{title}</h2>
      </div>
      <div className="sd-info-card__body">
        {rows.map(([label, value]) => (
          <div className="sd-row" key={label}>
            <span className="sd-row__label">{label}</span>
            <strong className="sd-row__value">{value || "—"}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsCard({ icon: Icon, title, rows }) {
  return (
    <div className="sd-info-card">
      <div className="sd-info-card__header">
        {Icon && (
          <div className="sd-info-card__icon">
            <Icon size={18} />
          </div>
        )}
        <h2 className="sd-info-card__title">{title}</h2>
      </div>
      <div className="sd-info-card__body">
        {rows.map(([label, value]) => (
          <div className="sd-row" key={label}>
            <span className="sd-row__label">{label}</span>
            <strong className="sd-row__value">{value || "—"}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
