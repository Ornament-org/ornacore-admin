import { Image as ImageIcon, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { PreviewListPage } from "../../../components/common/PreviewListPage.jsx";
import { ResourceFormModal } from "../../../components/common/ResourceFormModal.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { inventoryRows } from "../../../data/demoData.js";
import { inventoryService } from "../../../services/resourceServices.js";
import "../Inventory.scss";

function resolveProductImage(product) {
  const images = [...(product?.images ?? [])].sort(
    (first, second) =>
      Number(second.isPrimary) - Number(first.isPrimary) ||
      Number(first.displayOrder ?? 0) - Number(second.displayOrder ?? 0),
  );
  return images[0]?.media?.secureUrl ?? product?.imageUrl ?? null;
}

function InventoryProductCell({ row }) {
  return (
    <div className="inventory-product-cell">
      <span className={`inventory-product-cell__image ${row.imageUrl ? "has-image" : ""}`}>
        {row.imageUrl ? (
          <img alt={row.product} src={row.imageUrl} />
        ) : (
          <ImageIcon aria-hidden="true" size={18} />
        )}
      </span>
      <span className="inventory-product-cell__copy">
        <strong>{row.product}</strong>
        <small>{row.designCode}</small>
      </span>
    </div>
  );
}

const columns = [
  { key: "designCode", label: "Design Code" },
  {
    key: "product",
    label: "Product",
    render: (_value, row) => <InventoryProductCell row={row} />,
  },
  { key: "variant", label: "Variant" },
  { key: "available", label: "Available" },
  { key: "reserved", label: "Reserved" },
  { key: "threshold", label: "Low Stock Alert" },
  { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
];

const mapInventory = (rows) =>
  rows.map((row) => ({
    ...row,
    designCode: row.variant?.product?.designCode ?? "—",
    imageUrl: resolveProductImage(row.variant?.product),
    product: row.variant?.product?.name ?? "—",
    variant: row.variant?.sku ?? "—",
    available: row.availableQuantity ?? row.onHandQuantity,
    reserved: row.reservedQuantity,
    threshold: row.reorderLevel,
    status: row.stockStatus ?? "IN_STOCK",
  }));

const mapMovements = (rows) =>
  rows.map((row) => ({
    ...row,
    designCode: row.inventory?.variant?.product?.designCode ?? "—",
    imageUrl: resolveProductImage(row.inventory?.variant?.product),
    product: row.inventory?.variant?.product?.name ?? "—",
    variant: row.inventory?.variant?.sku ?? "—",
    available: row.balanceAfter,
    reserved: row.quantity,
    threshold: row.reason,
    status: row.movementType,
  }));

export function InventoryPage({ title = "Stock Overview" }) {
  const [modal, setModal] = useState({ open: false, record: null, refresh: null });
  const movements = title === "Stock Movements";
  const service = movements ? inventoryService.movements : inventoryService;
  const fields = useMemo(
    () => [
      {
        name: "movementType",
        label: "Movement type",
        type: "select",
        required: true,
        options: [
          "STOCK_IN",
          "STOCK_OUT",
          "ADJUSTMENT",
          "RESERVATION",
          "RESERVATION_RELEASE",
          "DAMAGED",
          "RETURNED",
        ],
      },
      { name: "quantity", label: "Quantity", type: "number", min: 0, required: true },
      { name: "reason", label: "Reason", type: "textarea", required: true, fullWidth: true },
    ],
    [],
  );
  const rowActions = ({ refresh }) => [
    {
      label: "Adjust stock",
      icon: SlidersHorizontal,
      onClick: (record) => setModal({ open: true, record, refresh }),
    },
  ];

  return (
    <>
      <PreviewListPage
        columns={columns}
        description="Monitor variant-level stock, reservations, and inventory movements."
        eyebrow="Inventory"
        hidePrimaryAction
        mapRows={movements ? mapMovements : mapInventory}
        moduleName="Inventory management"
        primaryAction="Adjust Stock"
        rowActions={movements ? [] : rowActions}
        rows={inventoryRows}
        service={service}
        title={title}
      />
      <ResourceFormModal
        description={
          modal.record
            ? `Update ${modal.record.variant} inventory with a traceable movement.`
            : "Choose a stock row first, then use its action menu to adjust inventory."
        }
        fields={fields}
        open={modal.open}
        title="Inventory adjustment"
        onClose={() => setModal({ open: false, record: null, refresh: null })}
        onSubmit={async (payload) => {
          if (!modal.record) throw new Error("Select an inventory record first");
          await inventoryService.adjust(modal.record.id, payload);
          modal.refresh?.();
        }}
      />
    </>
  );
}
