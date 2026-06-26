import { Clock3, PackageCheck, ReceiptText, ScrollText } from "lucide-react";

const iconByType = {
  GOLD_RECEIVED:       ReceiptText,
  ORDER_DELIVERED:     PackageCheck,
  ORDER_PLACED:        PackageCheck,
  LEDGER_ENTRY_ADDED:  ScrollText,
};

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function RecentActivityCard({ activities = [] }) {
  return (
    <div className="sd-info-card">
      <div className="sd-info-card__header">
        <div className="sd-info-card__icon">
          <Clock3 size={18} />
        </div>
        <h2 className="sd-info-card__title">Recent Activity</h2>
      </div>

      {activities.length ? (
        <div className="sd-activity-list">
          {activities.map((activity) => {
            const Icon = iconByType[activity.type] ?? Clock3;
            return (
              <div className="sd-activity-item" key={activity.id}>
                <div className="sd-activity-item__icon">
                  <Icon size={16} />
                </div>
                <div>
                  <p className="sd-activity-item__title">{activity.title}</p>
                  <p className="sd-activity-item__desc">{activity.description}</p>
                </div>
                <time>{fmtDate(activity.occurredAt)}</time>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="shopkeeper-details__state shopkeeper-details__state--compact">
          No recent activity.
        </div>
      )}
    </div>
  );
}
