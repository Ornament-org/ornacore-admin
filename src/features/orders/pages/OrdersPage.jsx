import { ArrowRightCircle, UserRoundCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { EntityCell } from "../../../components/common/EntityCell.jsx";
import { PreviewListPage } from "../../../components/common/PreviewListPage.jsx";
import { ResourceFormModal } from "../../../components/common/ResourceFormModal.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { orderRows } from "../../../data/demoData.js";
import { orderService } from "../../../services/resourceServices.js";
import { formatCurrency } from "../../../utils/formatters.js";

const columns = [
  { key: "id", label: "Order ID" },
  {
    key: "shopkeeper",
    label: "Shopkeeper",
    render: (value, row) => (
      <EntityCell initials={value.slice(0, 2).toUpperCase()} title={value} subtitle={row.city} />
    ),
  },
  { key: "amount", label: "Amount" },
  { key: "payment", label: "Payment", render: (value) => <StatusBadge status={value} /> },
  { key: "status", label: "Order Status", render: (value) => <StatusBadge status={value} /> },
  { key: "staff", label: "Assigned Staff" },
];

const statusByTitle = {
  "Requested Orders": "REQUESTED",
  "Confirmed Orders": "CONFIRMED",
  "Packed Orders": "PACKED",
  "Dispatched Orders": "DISPATCHED",
  "Delivered Orders": "DELIVERED",
  "Cancelled Orders": "CANCELLED",
};

const transitions = {
  REQUESTED: ["PRICE_CONFIRMED", "CONFIRMED", "CANCELLED"],
  PRICE_CONFIRMED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const mapOrders = (rows) =>
  rows.map((row) => ({
    ...row,
    id: row.orderNumber,
    recordId: row.id,
    shopkeeper: row.shopkeeper?.shopName ?? "—",
    city: row.shopkeeper?.city ?? "—",
    amount: formatCurrency(row.grandTotal, 2),
    payment: row.paymentStatus,
    staff: row.assignedStaff?.fullName ?? "Unassigned",
  }));

export function OrdersPage({ title = "All Orders" }) {
  const [modal, setModal] = useState({ open: false, type: null, record: null, refresh: null });
  const query = useMemo(
    () => (statusByTitle[title] ? { status: statusByTitle[title] } : {}),
    [title],
  );
  const fields = useMemo(() => {
    if (modal.type === "create") {
      return [
        { name: "shopkeeperId", label: "Shopkeeper ID", type: "number", required: true },
        { name: "productVariantId", label: "Product variant ID", type: "number", required: true },
        { name: "quantity", label: "Quantity", type: "number", min: 1, required: true },
        { name: "assignedStaffId", label: "Assigned staff ID", type: "number", nullable: true },
        { name: "notes", label: "Notes", type: "textarea", nullable: true, fullWidth: true },
      ];
    }
    if (modal.type === "assign") {
      return [
        { name: "assignedStaffId", label: "Staff ID", type: "number", nullable: true },
        {
          name: "note",
          label: "Assignment note",
          type: "textarea",
          nullable: true,
          fullWidth: true,
        },
      ];
    }
    return [
      {
        name: "status",
        label: "Next status",
        type: "select",
        required: true,
        options: transitions[modal.record?.status] ?? [],
      },
      { name: "note", label: "Status note", type: "textarea", nullable: true, fullWidth: true },
    ];
  }, [modal.record?.status, modal.type]);

  const rowActions = ({ refresh }) => [
    {
      label: "Update status",
      icon: ArrowRightCircle,
      hidden: (record) => transitions[record.status]?.length === 0,
      onClick: (record) => setModal({ open: true, type: "status", record, refresh }),
    },
    {
      label: "Assign staff",
      icon: UserRoundCheck,
      onClick: (record) => setModal({ open: true, type: "assign", record, refresh }),
    },
  ];

  return (
    <>
      <PreviewListPage
        columns={columns}
        description="Confirm pricing, assign staff, and control the complete order lifecycle."
        eyebrow="Orders"
        mapRows={mapOrders}
        moduleName="Order management"
        primaryAction="Create Order"
        query={query}
        rowActions={rowActions}
        rows={orderRows}
        service={orderService}
        statusOptions={Object.keys(transitions)}
        title={title}
        onPrimaryAction={(refresh) =>
          setModal({ open: true, type: "create", record: null, refresh })
        }
      />
      <ResourceFormModal
        description="Order pricing is recalculated by the backend and stored as an immutable snapshot."
        fields={fields}
        open={modal.open}
        submitLabel={
          modal.type === "create"
            ? "Create order"
            : modal.type === "assign"
              ? "Assign staff"
              : "Update status"
        }
        title={
          modal.type === "create"
            ? "Create order"
            : modal.type === "assign"
              ? "Assign order"
              : `Update ${modal.record?.id ?? "order"}`
        }
        onClose={() => setModal({ open: false, type: null, record: null, refresh: null })}
        onSubmit={async (payload) => {
          if (modal.type === "create") {
            const { productVariantId, quantity, ...order } = payload;
            await orderService.create({
              ...order,
              items: [{ productVariantId, quantity }],
            });
          } else if (modal.type === "assign") {
            await orderService.assign(modal.record.recordId, payload);
          } else {
            await orderService.updateStatus(modal.record.recordId, payload);
          }
          modal.refresh?.();
        }}
      />
    </>
  );
}
