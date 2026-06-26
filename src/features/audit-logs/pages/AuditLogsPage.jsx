import { PreviewListPage } from "../../../components/common/PreviewListPage.jsx";
import { auditLogService } from "../../../services/resourceServices.js";
import { formatDate } from "../../../utils/formatters.js";

const auditRows = [
  {
    id: "AUD-9081",
    date: "20 Jun 2026, 11:42 AM",
    user: "Super Admin",
    module: "Shopkeepers",
    action: "APPROVED",
    entity: "Ramesh Jewellers",
    ip: "127.0.0.1",
  },
  {
    id: "AUD-9080",
    date: "20 Jun 2026, 10:18 AM",
    user: "Amit Sharma",
    module: "Orders",
    action: "STATUS UPDATED",
    entity: "#ORD-2024-1258",
    ip: "192.168.1.44",
  },
  {
    id: "AUD-9079",
    date: "20 Jun 2026, 09:54 AM",
    user: "Neha Jain",
    module: "Payments",
    action: "PAYMENT ADDED",
    entity: "PAY-7401",
    ip: "192.168.1.38",
  },
];

const columns = [
  { key: "date", label: "Date & Time" },
  { key: "user", label: "User" },
  { key: "module", label: "Module" },
  { key: "action", label: "Action" },
  { key: "entity", label: "Affected Record" },
  { key: "ip", label: "IP Address" },
];

const mapAuditLogs = (rows) =>
  rows.map((row) => ({
    ...row,
    date: formatDate(row.createdAt, true),
    user: row.actor?.email ?? "System",
    module: row.module,
    action: row.action.replaceAll("_", " "),
    entity: `${row.entityType ?? "Record"}${row.entityId ? ` #${row.entityId}` : ""}`,
    ip: row.ipAddress ?? "—",
  }));

export function AuditLogsPage() {
  return (
    <PreviewListPage
      eyebrow="Administration"
      title="Audit Logs"
      description="Review immutable administrative actions and business state changes."
      moduleName="Audit log querying"
      columns={columns}
      rows={auditRows}
      service={auditLogService}
      mapRows={mapAuditLogs}
      hidePrimaryAction
    />
  );
}
