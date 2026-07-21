import "./StatusTabs.scss";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING_REVIEW", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
];

// Used to live as four separate routes/nav items (Pending, Approved,
// Rejected, Suspended) — collapsed into one Shopkeepers screen with these as
// an in-page filter instead, so there's a single place to browse all of it.
export function StatusTabs({ value = "", onChange, disabled = false }) {
  return (
    <div className="sk-status-tabs" role="tablist" aria-label="Filter shopkeepers by status">
      {STATUS_TABS.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            aria-selected={active}
            className={active ? "is-active" : ""}
            disabled={disabled}
            key={tab.value || "all"}
            role="tab"
            type="button"
            onClick={() => onChange?.(tab.value)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
