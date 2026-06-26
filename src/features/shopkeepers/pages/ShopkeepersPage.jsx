import { Ban, CheckCircle2, CircleOff, CircleX, Eye, Pencil, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EntityCell } from "../../../components/common/EntityCell.jsx";
import { PreviewListPage } from "../../../components/common/PreviewListPage.jsx";
import { ResourceFormModal } from "../../../components/common/ResourceFormModal.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { shopkeeperRows } from "../../../data/demoData.js";
import { metalService, shopkeeperService } from "../../../services/resourceServices.js";
import { formatCurrency } from "../../../utils/formatters.js";
import { MetalCreditLimitEditor } from "../components/MetalCreditLimitEditor.jsx";

const columns = [
  {
    key: "shop",
    label: "Shopkeeper",
    render: (value, row) => (
      <EntityCell
        initials={value
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)}
        title={value}
        subtitle={row.id}
      />
    ),
  },
  { key: "owner", label: "Owner" },
  { key: "city", label: "City" },
  { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
  { key: "due", label: "Due Amount" },
  { key: "staff", label: "Assigned Staff" },
];

const statusByTitle = {
  "Pending Approval": "PENDING_REVIEW",
  "Approved Shopkeepers": "APPROVED",
  "Rejected Shopkeepers": "REJECTED",
  "Suspended Shopkeepers": "SUSPENDED",
};

const mapShopkeepers = (rows) =>
  rows.map((row) => ({
    ...row,
    shop: row.shopName,
    owner: row.ownerName,
    due: formatCurrency(row.dueAmount),
    staff: row.assignedSalesperson?.fullName ?? "Unassigned",
    creditLimits: row.metalCreditLimits ?? row.creditLimits ?? [],
  }));

export function ShopkeepersPage({ title = "All Shopkeepers" }) {
  const navigate = useNavigate();
  const [metals, setMetals] = useState([]);
  const [modal, setModal] = useState({ open: false, type: null, record: null, refresh: null });
  const query = useMemo(
    () => (statusByTitle[title] ? { status: statusByTitle[title] } : {}),
    [title],
  );

  useEffect(() => {
    metalService
      .list({ pageSize: 100 })
      .then((response) => setMetals(response.data ?? []))
      .catch(() => setMetals([]));
  }, []);

  const creditLimitField = useMemo(
    () => ({
      name: "creditLimits",
      label: "Credit limits in gm",
      type: "custom",
      fullWidth: true,
      defaultValue: [],
      render: ({ value, setValue }) => (
        <MetalCreditLimitEditor metals={metals} value={value} onChange={setValue} />
      ),
      serialize: (value = []) =>
        value
          .filter((row) => row.metalId && row.creditLimitGrams !== "")
          .map((row) => ({
            metalId: Number(row.metalId),
            creditLimitGrams: Number(row.creditLimitGrams),
          })),
    }),
    [metals],
  );

  const fields = useMemo(() => {
    if (modal.type === "approve") {
      return [
        creditLimitField,
        { name: "internalNote", label: "Internal note", type: "textarea", nullable: true },
      ];
    }
    if (modal.type === "edit") {
      return [
        { name: "ownerName", label: "Owner name", required: true },
        { name: "shopName", label: "Shop name", required: true },
        { name: "city", label: "City", nullable: true },
        { name: "state", label: "State", nullable: true },
        { name: "pincode", label: "Pincode", nullable: true },
        { name: "gstNumber", label: "GST number", nullable: true },
        {
          name: "addressLine1",
          label: "Address",
          type: "textarea",
          nullable: true,
          fullWidth: true,
        },
        creditLimitField,
      ];
    }
    return [{ name: "reason", label: "Reason", type: "textarea", required: true, fullWidth: true }];
  }, [creditLimitField, modal.type]);

  const openAction = (type, record, refresh) => setModal({ open: true, type, record, refresh });

  const canApprove = (status) => ["DRAFT", "PENDING_REVIEW", "REJECTED", "SUSPENDED"].includes(status);
  const canRequestMoreInfo = (status) => ["DRAFT", "PENDING_REVIEW", "REJECTED", "SUSPENDED"].includes(status);
  const canSuspend = (status) => ["APPROVED", "REJECTED"].includes(status);
  const canReject = (status) => ["DRAFT", "PENDING_REVIEW", "SUSPENDED"].includes(status);
  const canBlock = (status) => ["APPROVED", "REJECTED", "SUSPENDED", "PENDING_REVIEW", "DRAFT"].includes(status);

  const rowActions = ({ refresh }) => [
    {
      label: "View details",
      icon: Eye,
      onClick: (record) => navigate(`/shopkeepers/${record.id}`),
    },
    {
      label: "Edit profile",
      icon: Pencil,
      onClick: (record) => openAction("edit", record, refresh),
    },
    {
      label: "Approve",
      icon: CheckCircle2,
      hidden: (record) => !canApprove(record.status),
      onClick: (record) => openAction("approve", record, refresh),
    },
    {
      label: "Request more info",
      icon: RotateCcw,
      hidden: (record) => !canRequestMoreInfo(record.status),
      onClick: (record) => openAction("requestMoreInfo", record, refresh),
    },
    {
      label: "Suspend",
      icon: CircleOff,
      hidden: (record) => !canSuspend(record.status),
      onClick: (record) => openAction("suspend", record, refresh),
    },
    {
      label: "Reject",
      icon: CircleX,
      danger: true,
      hidden: (record) => !canReject(record.status),
      onClick: (record) => openAction("reject", record, refresh),
    },
    {
      label: "Block",
      icon: Ban,
      danger: true,
      hidden: (record) => !canBlock(record.status),
      onClick: (record) => openAction("block", record, refresh),
    },
  ];

  return (
    <>
      <PreviewListPage
        columns={columns}
        description="Review, approve, and manage B2B buyer relationships."
        eyebrow="Shopkeepers"
        hidePrimaryAction
        mapRows={mapShopkeepers}
        moduleName="Shopkeeper management"
        query={query}
        rowActions={rowActions}
        rows={shopkeeperRows}
        service={shopkeeperService}
        statusOptions={["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "SUSPENDED", "BLOCKED"]}
        title={title}
      />
      <ResourceFormModal
        description={`Update ${modal.record?.shopName ?? "shopkeeper"} safely with an audited action.`}
        fields={fields}
        open={modal.open}
        record={modal.type === "edit" ? modal.record : null}
        submitLabel={modal.type === "approve" ? "Approve account" : "Confirm action"}
        title={
          modal.type === "edit"
            ? "Edit shopkeeper"
            : modal.type === "approve"
              ? "Approve shopkeeper"
              : "Shopkeeper status action"
        }
        onClose={() => setModal({ open: false, type: null, record: null, refresh: null })}
        onSubmit={async (payload) => {
          if (modal.type === "edit") {
            await shopkeeperService.update(modal.record.id, payload);
          } else {
            await shopkeeperService[modal.type](modal.record.id, payload);
          }
          modal.refresh?.();
        }}
      />
    </>
  );
}
