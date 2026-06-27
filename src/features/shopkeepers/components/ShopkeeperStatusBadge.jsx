import { Badge } from "../../../components/common/Badge.jsx";
import { formatDate } from "../../../utils/formatters.js";
import "./ShopkeeperStatusBadge.scss";

const toneByStatus = {
  APPROVED: "success",
  PENDING_REVIEW: "warning",
  DRAFT: "neutral",
  REJECTED: "danger",
  SUSPENDED: "danger",
  BLOCKED: "danger",
};

const labelByStatus = {
  APPROVED: "APPROVED",
  PENDING_REVIEW: "PENDING",
  DRAFT: "DRAFT",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
  BLOCKED: "BLOCKED",
};

export function ShopkeeperStatusBadge({ status, sinceDate }) {
  return (
    <div className="sk-status-badge">
      <Badge tone={toneByStatus[status] ?? "neutral"}>
        {labelByStatus[status] ?? status}
      </Badge>
      {sinceDate && (
        <span className="sk-status-badge__since">Since {formatDate(sinceDate)}</span>
      )}
    </div>
  );
}
