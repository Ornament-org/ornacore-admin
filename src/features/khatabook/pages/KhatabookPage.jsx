import { useCallback, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "../../../components/common/Card.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { khatabookService } from "../../../services/resourceServices.js";
import { AddCollectionModal } from "../collections/addCollection/AddCollectionModal.jsx";
import { CreateKhatabookOrder } from "../components/CreateKhatabookOrder.jsx";
import { KhatabookFilters } from "../components/KhatabookFilters.jsx";
import { KhatabookOrderList } from "../components/KhatabookOrderList.jsx";
import { formatDate, formatQuantity } from "../components/khatabookFormatters.js";
import { SkeletonKhatabook } from "../../../components/skeleton/SkeletonKhatabook.jsx";
import { useKhatabookMetals, useKhatabookOrders, useKhatabookRefresh } from "../hooks/useKhatabookData.js";
import "./Khatabook.scss";

export function KhatabookPage({ shopkeeperId, view = "orders" }) {
  const [selectedMetalId, setSelectedMetalId] = useState("");
  const [search, setSearch]                   = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [creating, setCreating]               = useState(false);
  const [ledgerOrder, setLedgerOrder]         = useState(null);
  const [ledgerRows, setLedgerRows]           = useState([]);

  // BUG-3: state for the per-order collection modal
  const [collectionModal, setCollectionModal] = useState(null); // null | { shopkeeperId, metalId }

  // ── Redux-backed data ─────────────────────────────────────────────────────
  const { metals, loading: metalsLoading, status: metalsStatus } = useKhatabookMetals(shopkeeperId);
  const { orders } = useKhatabookOrders(shopkeeperId, {
    metalId: selectedMetalId,
    search,
  });
  const refresh = useKhatabookRefresh(shopkeeperId);

  const loading = metalsLoading && orders.length === 0;

  // BUG-10: surface API failures instead of hardcoding error = false
  const metalsStatusVal = metalsStatus ?? "idle";
  const error = metalsStatusVal === "failed";

  // ── Ledger panel ──────────────────────────────────────────────────────────
  const openLedger = useCallback((order) => {
    setLedgerOrder(order);
    khatabookService
      .orderLedger(order.id)
      .then((res) => setLedgerRows(Array.isArray(res) ? res : (res?.data ?? [])))
      .catch(() => setLedgerRows([]));
  }, []);

  // BUG-3: handlers for per-order collection buttons in ExpandedOrderCard
  const handleAddMetalCollection = useCallback((order) => {
    setCollectionModal({
      shopkeeperId: order.shopkeeperId ?? shopkeeperId,
      metalId: order.metalId ?? order.metal?.id,
    });
  }, [shopkeeperId]);

  const handleAddCashCollection = useCallback((order) => {
    setCollectionModal({
      shopkeeperId: order.shopkeeperId ?? shopkeeperId,
      metalId: order.metalId ?? order.metal?.id,
    });
  }, [shopkeeperId]);

  const displayedLedgerRows = useMemo(() => {
    if (ledgerOrder) return ledgerRows;
    return orders.flatMap((order) => [
      {
        id:             `order-${order.id}`,
        entryDate:      order.entryDate,
        entryType:      "DELIVERY",
        metal:          order.metal,
        orderId:        order.id,
        debitFine:      order.fineDelivered,
        creditFine:     "0.000",
        runningBalance: order.runningDue,
        description:    `${order.orderNumber} delivery`,
      },
    ]);
  }, [ledgerOrder, ledgerRows, orders]);

  const ledgerPanel = (
    <Card className="khatabook-ledger">
      <div className="khatabook-ledger__header">
        <div>
          <h2>{ledgerOrder ? `Ledger - ${ledgerOrder.orderNumber}` : "Ledger"}</h2>
          <p>{ledgerOrder ? ledgerOrder.metal?.name : "Latest metal-wise khatabook movement"}</p>
        </div>
        {ledgerOrder && (
          <button type="button" onClick={() => setLedgerOrder(null)}>
            Show All
          </button>
        )}
      </div>
      <div className="khatabook-ledger__table">
        <div className="khatabook-ledger__row khatabook-ledger__row--head">
          <span>Date</span>
          <span>Metal</span>
          <span>Type</span>
          <span>Debit</span>
          <span>Credit</span>
          <span>Balance</span>
        </div>
        {displayedLedgerRows.map((row) => (
          <div className="khatabook-ledger__row" key={row.id}>
            <span>
              <strong>{formatDate(row.entryDate)}</strong>
              <small>{row.description}</small>
            </span>
            <span>{row.metal?.name ?? "—"}</span>
            <span>{row.entryType}</span>
            <span>{formatQuantity(row.debitFine)}</span>
            <span>{formatQuantity(row.creditFine)}</span>
            <span>{formatQuantity(row.runningBalance)}</span>
          </div>
        ))}
      </div>
    </Card>
  );

  if (loading) return <SkeletonKhatabook />;
  // BUG-10: render error state when metals API fails
  if (error) return <FormAlert>Unable to load khatabook. Please refresh and try again.</FormAlert>;

  return (
    <div className="khatabook">
      {view === "orders" && (
        <>
          <div className="khatabook-toolbar">
            <button type="button" onClick={() => setCreating(true)}>
              <Plus size={17} />
              Create New Order
            </button>
          </div>

          {creating && (
            <CreateKhatabookOrder
              defaultMetalId={selectedMetalId}
              metals={metals}
              shopkeeperId={shopkeeperId}
              onCancel={() => setCreating(false)}
              onCreated={() => {
                setCreating(false);
                refresh();
              }}
            />
          )}

          <KhatabookFilters
            metalId={selectedMetalId}
            metals={metals}
            search={search}
            onMetalChange={(metalId) => {
              setSelectedMetalId(metalId);
              setExpandedOrderId(null);
            }}
            onSearchChange={setSearch}
          />

          <KhatabookOrderList
            expandedOrderId={expandedOrderId}
            orders={orders}
            onToggleOrder={(orderId) =>
              setExpandedOrderId((cur) => (String(cur) === String(orderId) ? null : orderId))
            }
            onViewLedger={openLedger}
            onAddMetalCollection={handleAddMetalCollection}
            onAddCashCollection={handleAddCashCollection}
          />

          {ledgerOrder && ledgerPanel}
        </>
      )}

      {view === "ledger" && ledgerPanel}

      {/* BUG-3: collection modal opened from per-order buttons */}
      {collectionModal && (
        <AddCollectionModal
          defaultShopkeeperId={collectionModal.shopkeeperId}
          defaultMetalId={collectionModal.metalId}
          onClose={() => setCollectionModal(null)}
          onSuccess={() => {
            setCollectionModal(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
