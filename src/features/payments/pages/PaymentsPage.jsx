import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { PreviewListPage } from "../../../components/common/PreviewListPage.jsx";
import { ResourceFormModal } from "../../../components/common/ResourceFormModal.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { paymentRows } from "../../../data/demoData.js";
import { paymentService } from "../../../services/resourceServices.js";
import { formatCurrency, formatDate } from "../../../utils/formatters.js";

const columns = [
  { key: "id", label: "Payment ID" },
  { key: "shopkeeper", label: "Shopkeeper" },
  { key: "method", label: "Method" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
  { key: "reference", label: "Reference" },
  { key: "date", label: "Payment Date" },
];

const mapPayments = (rows) =>
  rows.map((row) => ({
    ...row,
    id: row.paymentNumber,
    recordId: row.id,
    shopkeeper: row.shopkeeper?.shopName ?? "—",
    amount: formatCurrency(row.amount, 2),
    reference: row.externalReference ?? row.order?.orderNumber ?? "—",
    date: formatDate(row.receivedAt ?? row.createdAt, true),
  }));

const mapDue = (rows) =>
  rows.map((row) => ({
    ...row,
    id: `SHOP-${row.id}`,
    recordId: row.id,
    shopkeeper: row.shopName,
    method: "Accounts ledger",
    amount: formatCurrency(row.totalDue, 2),
    status: Number(row.totalDue) > 0 ? "UNPAID" : "PAID",
    reference: `Credit limit ${formatCurrency(row.creditLimit)}`,
    date: "Current balance",
  }));

export function PaymentsPage({ title = "Payment Records" }) {
  const [modal, setModal] = useState({ open: false, type: null, record: null, refresh: null });
  const dueView = title === "Due Amounts" || title === "Credit Orders";
  const service = dueView ? paymentService.due : paymentService;
  const fields = useMemo(
    () =>
      modal.type === "refund"
        ? [
            {
              name: "status",
              label: "Status",
              type: "select",
              options: ["REFUNDED"],
              defaultValue: "REFUNDED",
              required: true,
            },
            {
              name: "notes",
              label: "Refund note",
              type: "textarea",
              nullable: true,
              fullWidth: true,
            },
          ]
        : [
            { name: "shopkeeperId", label: "Shopkeeper ID", type: "number", required: true },
            { name: "orderId", label: "Order ID", type: "number", nullable: true },
            {
              name: "method",
              label: "Payment method",
              type: "select",
              options: ["CASH", "BANK_TRANSFER", "UPI", "ONLINE_GATEWAY", "CREDIT"],
              required: true,
            },
            { name: "amount", label: "Amount", type: "number", min: 0, required: true },
            { name: "externalReference", label: "Reference", nullable: true },
            { name: "notes", label: "Notes", type: "textarea", nullable: true, fullWidth: true },
          ],
    [modal.type],
  );
  const rowActions = ({ refresh }) => [
    {
      label: "Refund payment",
      icon: RotateCcw,
      danger: true,
      hidden: (record) => record.status !== "COMPLETED",
      onClick: (record) => setModal({ open: true, type: "refund", record, refresh }),
    },
  ];

  return (
    <>
      <PreviewListPage
        columns={columns}
        description="Track collections, credit exposure, due balances, and payment evidence."
        eyebrow="Payments"
        mapRows={dueView ? mapDue : mapPayments}
        moduleName="Payments and accounts ledger"
        primaryAction="Add Payment"
        rowActions={dueView ? [] : rowActions}
        rows={paymentRows}
        service={service}
        title={title}
        onPrimaryAction={(refresh) =>
          setModal({ open: true, type: "create", record: null, refresh })
        }
      />
      <ResourceFormModal
        description={
          modal.type === "refund"
            ? "This posts a reversing double-entry journal and recalculates the order balance."
            : "Record a received payment and automatically update the accounts ledger."
        }
        fields={fields}
        open={modal.open}
        submitLabel={modal.type === "refund" ? "Refund payment" : "Record payment"}
        title={modal.type === "refund" ? "Refund payment" : "Add payment"}
        onClose={() => setModal({ open: false, type: null, record: null, refresh: null })}
        onSubmit={async (payload) => {
          if (modal.type === "refund") {
            await paymentService.updateStatus(modal.record.recordId, payload);
          } else {
            await paymentService.create(payload);
          }
          modal.refresh?.();
        }}
      />
    </>
  );
}
