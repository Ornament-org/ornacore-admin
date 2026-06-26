import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { PreviewListPage } from "../../../components/common/PreviewListPage.jsx";
import { ResourceFormModal } from "../../../components/common/ResourceFormModal.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { pricingOverrideService, pricingRuleService } from "../../../services/resourceServices.js";
import { formatCurrency, humanize } from "../../../utils/formatters.js";

const pricingRows = [];

const columns = [
  { key: "id", label: "Code" },
  { key: "shopkeepers", label: "Scope" },
  { key: "discount", label: "Default Discount" },
  { key: "makingCharge", label: "Making Charge" },
  { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
];

const mapRules = (rows) =>
  rows.map((row) => ({
    ...row,
    name: row.product?.name ?? row.variant?.sku ?? "Global rule",
    shopkeepers: "All shopkeepers",
    discount:
      row.ruleType === "FIXED" ? formatCurrency(row.basePrice, 2) : `${row.percentageValue ?? 0}%`,
    makingCharge: row.makingCharge ? formatCurrency(row.makingCharge, 2) : humanize(row.ruleType),
    status: row.isActive ? "ACTIVE" : "INACTIVE",
  }));

const mapOverrides = (rows) =>
  rows.map((row) => ({
    ...row,
    name: row.shopkeeper?.shopName ?? `Shopkeeper #${row.shopkeeperId}`,
    shopkeepers: row.variant?.sku ?? `Variant #${row.productVariantId}`,
    discount: formatCurrency(row.overridePrice, 2),
    makingCharge: row.reason ?? "Custom override",
    status: row.isActive ? "ACTIVE" : "INACTIVE",
  }));

export function PricingPage({ title = "Product Pricing" }) {
  const [modal, setModal] = useState({ open: false, record: null, refresh: null });
  const mode = title === "Shopkeeper Pricing" ? "overrides" : "rules";
  const service = mode === "rules" ? pricingRuleService : pricingOverrideService;
  const mapRows = mode === "rules" ? mapRules : mapOverrides;
        const fields = useMemo(() => {
    if (mode === "rules") {
      return [
        { name: "productId", label: "Product ID", type: "number", nullable: true },
        { name: "productVariantId", label: "Variant ID", type: "number", nullable: true },
        {
          name: "ruleType",
          label: "Rule type",
          type: "select",
          required: true,
          options: [
            "FIXED",
            "METAL_RATE_BASED",
            "PERCENTAGE_MARGIN",
            "PERCENTAGE_DISCOUNT",
            "BULK",
          ],
        },
        { name: "basePrice", label: "Base price", type: "number", min: 0, nullable: true },
        { name: "makingCharge", label: "Making charge", type: "number", min: 0, nullable: true },
        { name: "percentageValue", label: "Percentage", type: "number", nullable: true },
        { name: "minimumQuantity", label: "Minimum quantity", type: "number", nullable: true },
        { name: "priority", label: "Priority", type: "number", defaultValue: 0 },
        { name: "isActive", label: "Active", type: "checkbox", defaultValue: true },
      ];
    }
    if (mode === "overrides") {
      return [
        { name: "shopkeeperId", label: "Shopkeeper ID", type: "number", required: true },
        { name: "productVariantId", label: "Variant ID", type: "number", required: true },
        { name: "overridePrice", label: "Override price", type: "number", min: 0, required: true },
        { name: "reason", label: "Reason", type: "textarea", nullable: true, fullWidth: true },
        { name: "isActive", label: "Active", type: "checkbox", defaultValue: true },
      ];
    }
  }, [mode]);

  const rowActions = ({ refresh }) => [
    {
      label: "Edit",
      icon: Pencil,
      onClick: (record) => setModal({ open: true, record, refresh }),
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: async (record) => {
        if (window.confirm("Delete this pricing configuration?")) {
          await service.remove(record.id);
          refresh();
        }
      },
    },
  ];

  return (
    <>
      <PreviewListPage
        columns={columns}
        description="Control product pricing, shopkeeper overrides, margins, and quantity tiers."
        eyebrow="Pricing"
        mapRows={mapRows}
        moduleName="Pricing engine"
        primaryAction={`Create ${mode === "rules" ? "Rule" : "Override"}`}
        rowActions={rowActions}
        rows={pricingRows}
        service={service}
        title={title}
        onPrimaryAction={(refresh) => setModal({ open: true, record: null, refresh })}
      />
      <ResourceFormModal
        description="Pricing changes apply to future calculations and are recorded in the audit log."
        fields={fields}
        open={modal.open}
        record={modal.record}
        title={`${modal.record ? "Edit" : "Create"} pricing configuration`}
        onClose={() => setModal({ open: false, record: null, refresh: null })}
        onSubmit={async (payload) => {
          if (modal.record) await service.update(modal.record.id, payload);
          else await service.create(payload);
          modal.refresh?.();
        }}
      />
    </>
  );
}
