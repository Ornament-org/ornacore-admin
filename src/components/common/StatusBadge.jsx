import { Badge } from "./Badge.jsx";

const toneByStatus = {
  ACTIVE: "success",
  APPROVED: "success",
  CONFIRMED: "success",
  DELIVERED: "success",
  PAID: "success",
  "IN STOCK": "success",
  PENDING: "warning",
  "PENDING REVIEW": "warning",
  PACKED: "warning",
  REQUESTED: "purple",
  DISPATCHED: "info",
  "PARTIALLY PAID": "info",
  "LOW STOCK": "danger",
  "OUT OF STOCK": "danger",
  SUSPENDED: "danger",
  REJECTED: "danger",
  CANCELLED: "danger",
  CREDIT: "purple",
  UNPAID: "warning",
};

export function StatusBadge({ status }) {
  return <Badge tone={toneByStatus[status] || "neutral"}>{status}</Badge>;
}
