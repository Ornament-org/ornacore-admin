import { CirclePlus, CircleMinus, Image as ImageIcon, ListChecks } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PreviewListPage } from "../../../components/common/PreviewListPage.jsx";
import { ResourceFormModal } from "../../../components/common/ResourceFormModal.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { inventoryRows } from "../../../data/demoData.js";
import { inventoryService } from "../../../services/resourceServices.js";
import "../Inventory.scss";

// The backend stores quantities as 3-decimal-place figures (e.g. "10.000")
// for fractional-weight stock, but piece counts read cleaner as whole numbers.
const toWholeNumber = (value) => Math.round(Number(value ?? 0));

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

// Current stock at a glance: an editable count (type a new number and tab
// or click away to save it as a stock count correction) plus its status.
function InventoryStockCell({ row, onCommit }) {
  const [value, setValue] = useState(String(row.onHand));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!saving) setValue(String(row.onHand));
  }, [row.onHand, saving]);

  const commit = async () => {
    const next = toWholeNumber(value);
    if (!Number.isFinite(next) || next < 0 || next === row.onHand) {
      setValue(String(row.onHand));
      return;
    }
    setSaving(true);
    try {
      await onCommit(row, next);
    } catch {
      setValue(String(row.onHand));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="inventory-stock-cell">
      <input
        aria-label={`Current stock for ${row.product}`}
        className="inventory-stock-cell__input"
        disabled={saving}
        min="0"
        step="1"
        type="number"
        value={value}
        onBlur={commit}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") setValue(String(row.onHand));
        }}
      />
      <StatusBadge status={row.status} />
    </div>
  );
}

const movementColumns = [
  { key: "designCode", label: "Design Code" },
  {
    key: "product",
    label: "Product",
    render: (_value, row) => <InventoryProductCell row={row} />,
  },
  { key: "variant", label: "Variant" },
  { key: "onHand", label: "On Hand" },
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
    onHand: toWholeNumber(row.onHandQuantity),
    available: toWholeNumber(row.availableQuantity ?? row.onHandQuantity),
    reserved: toWholeNumber(row.reservedQuantity),
    threshold: toWholeNumber(row.reorderLevel),
    status: row.stockStatus ?? "IN_STOCK",
  }));

const mapMovements = (rows) =>
  rows.map((row) => ({
    ...row,
    designCode: row.inventory?.variant?.product?.designCode ?? "—",
    imageUrl: resolveProductImage(row.inventory?.variant?.product),
    product: row.inventory?.variant?.product?.name ?? "—",
    variant: row.inventory?.variant?.sku ?? "—",
    available: toWholeNumber(row.balanceAfter),
    reserved: toWholeNumber(row.quantity),
    threshold: row.reason,
    status: row.movementType,
  }));

// Three plain actions instead of the raw 7-option movement-type dropdown —
// receiving stock, selling/using it up, and correcting a miscount are the
// day-to-day cases; the underlying movement types (STOCK_IN/STOCK_OUT/
// ADJUSTMENT) are picked for the admin rather than asked of them.
const ACTION_META = {
  add: {
    movementType: "STOCK_IN",
    title: "Add stock",
    submitLabel: "Add stock",
    quantityLabel: "Quantity received",
  },
  remove: {
    movementType: "STOCK_OUT",
    title: "Remove stock",
    submitLabel: "Remove stock",
    quantityLabel: "Quantity to remove",
  },
  set: {
    movementType: "ADJUSTMENT",
    title: "Set exact count",
    submitLabel: "Save count",
    quantityLabel: "New on-hand quantity",
  },
};

export function InventoryPage({ title = "Stock Overview" }) {
  const [modal, setModal] = useState({ open: false, type: null, record: null, refresh: null });
  const movements = title === "Stock Movements";
  const service = movements ? inventoryService.movements : inventoryService;

  const fields = useMemo(() => {
    const meta = ACTION_META[modal.type];
    if (!meta) return [];
    return [
      {
        name: "quantity",
        label: meta.quantityLabel,
        type: "number",
        min: 0,
        required: true,
      },
      { name: "reason", label: "Reason", type: "textarea", required: true, fullWidth: true },
    ];
  }, [modal.type]);

  const rowActions = ({ refresh }) => [
    {
      label: "Add stock",
      icon: CirclePlus,
      onClick: (record) => setModal({ open: true, type: "add", record, refresh }),
    },
    {
      label: "Remove stock",
      icon: CircleMinus,
      hidden: (record) => Number(record.available) <= 0,
      onClick: (record) => setModal({ open: true, type: "remove", record, refresh }),
    },
    {
      label: "Set exact count",
      icon: ListChecks,
      onClick: (record) => setModal({ open: true, type: "set", record, refresh }),
    },
  ];

  const activeMeta = ACTION_META[modal.type];

  const stockColumns = useMemo(
    () => [
      { key: "designCode", label: "Design Code" },
      {
        key: "product",
        label: "Product",
        render: (_value, row) => <InventoryProductCell row={row} />,
      },
      { key: "variant", label: "Variant" },
      {
        key: "onHand",
        label: "Current Stock",
        render: (_value, row, context) => (
          <InventoryStockCell
            row={row}
            onCommit={async (record, quantity) => {
              await inventoryService.adjustByVariant(record.id, {
                quantity,
                movementType: "ADJUSTMENT",
                reason: "Stock count updated from Inventory",
              });
              context?.refresh?.();
            }}
          />
        ),
      },
      { key: "available", label: "Available" },
      { key: "reserved", label: "Reserved" },
      { key: "threshold", label: "Low Stock Alert" },
    ],
    [],
  );

  return (
    <>
      <PreviewListPage
        columns={movements ? movementColumns : stockColumns}
        description="See every product's stock at a glance and add, remove, or recount it directly."
        eyebrow="Inventory"
        hidePrimaryAction
        mapRows={movements ? mapMovements : mapInventory}
        moduleName="Inventory management"
        rowActions={movements ? [] : rowActions}
        rows={inventoryRows}
        service={service}
        title={title}
      />
      <ResourceFormModal
        description={
          modal.record
            ? `${activeMeta?.title ?? "Adjust"} for ${modal.record.product} — ${modal.record.variant}. Currently ${modal.record.available} available.`
            : "Choose a stock row first, then use its action menu."
        }
        fields={fields}
        open={modal.open}
        submitLabel={activeMeta?.submitLabel ?? "Save"}
        title={modal.record ? `${activeMeta?.title ?? "Adjust"} — ${modal.record.variant}` : "Adjust stock"}
        onClose={() => setModal({ open: false, type: null, record: null, refresh: null })}
        onSubmit={async (payload) => {
          if (!modal.record) throw new Error("Select an inventory record first");
          await inventoryService.adjustByVariant(modal.record.id, {
            ...payload,
            movementType: activeMeta.movementType,
          });
          modal.refresh?.();
        }}
      />
    </>
  );
}
