import { CircleAlert, DatabaseZap } from "lucide-react";
import { Badge } from "./Badge.jsx";
import "./SectionState.scss";

export function BackendPendingBanner({ moduleName }) {
  return (
    <div className="backend-banner">
      <DatabaseZap size={18} />
      <div>
        <strong>{moduleName} API contract is ready</strong>
        <p>
          The backend route exists, but its business endpoints are not implemented yet. This screen
          is using clearly marked preview data.
        </p>
      </div>
      <Badge tone="warning">Backend pending</Badge>
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <CircleAlert size={22} />
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
