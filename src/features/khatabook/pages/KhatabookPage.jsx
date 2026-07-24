import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "../../../components/common/Card.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { Skeleton } from "../../../components/skeleton/Skeleton.jsx";
import { khatabookService, metalService } from "../../../services/resourceServices.js";
import { AddCollectionModal } from "../collections/addCollection/AddCollectionModal.jsx";
import { QuickCollectionModal } from "../collections/addCollection/QuickCollectionModal.jsx";
import { CreateKhatabookOrder } from "../components/CreateKhatabookOrder.jsx";
import { KhatabookFilters } from "../components/KhatabookFilters.jsx";
import { KhatabookOrderList } from "../components/KhatabookOrderList.jsx";
import { formatDate, formatMoney, formatQuantity, formatTime } from "../components/khatabookFormatters.js";
import { SkeletonKhatabook } from "../../../components/skeleton/SkeletonKhatabook.jsx";
import { useKhatabookMetals, useKhatabookOrders, useKhatabookRefresh } from "../hooks/useKhatabookData.js";
import "./Khatabook.scss";

export function KhatabookPage({
  shopkeeperId,
  shopName,
  initialSourceOrderId,
  onCollectionAdded,
  onSourceOrderConsumed,
  view = "orders",
}) {
  const [selectedMetalId, setSelectedMetalId] = useState("");
  const [search, setSearch]                   = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [creating, setCreating]               = useState(() => view === "orders" && Boolean(initialSourceOrderId));
  const [ledgerOrder, setLedgerOrder]             = useState(null);
  const [ledgerRows, setLedgerRows]               = useState([]);
  const [ledgerLoading, setLedgerLoading]         = useState(false);
  const [accountLedgerRows, setAccountLedgerRows] = useState([]);
  const [accountLedgerLoading, setAccountLedgerLoading] = useState(false);

  // BUG-3: state for the per-order collection modal
  const [collectionModal, setCollectionModal] = useState(null); // null | { shopkeeperId, metalId }

  // Quick collection modal — toolbar-level, shopkeeper pre-locked
  const [quickCollectionOpen, setQuickCollectionOpen] = useState(false);

  // ── Ledger metals filter (fetched independently of khatabook Redux cache) ──
  const [ledgerMetals, setLedgerMetals]         = useState([]);
  const [ledgerMetalsLoading, setLedgerMetalsLoading] = useState(false);

  useEffect(() => {
    if (view !== "ledger") return;
    let alive = true;
    Promise.resolve().then(() => {
      if (!alive) return;
      setLedgerMetalsLoading(true);
      metalService
        .list({ pageSize: 100, isActive: true })
        .then((res) => { if (alive) setLedgerMetals(res.data ?? []); })
        .catch(() => { if (alive) setLedgerMetals([]); })
        .finally(() => { if (alive) setLedgerMetalsLoading(false); });
    });
    return () => { alive = false; };
  }, [view]);

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
    setLedgerRows([]);
    setLedgerLoading(true);
    khatabookService
      .orderLedger(order.id)
      .then((res) => setLedgerRows(Array.isArray(res) ? res : (res?.data ?? [])))
      .catch(() => setLedgerRows([]))
      .finally(() => setLedgerLoading(false));
  }, []);

  useEffect(() => {
    if (view !== "ledger" || !shopkeeperId) return;
    let alive = true;
    Promise.resolve().then(() => {
      if (!alive) return;
      setAccountLedgerLoading(true);
      setAccountLedgerRows([]);
      khatabookService
        .ledger(shopkeeperId, {
          metalId: selectedMetalId || undefined,
          pageSize: 100,
        })
        .then((res) => {
          if (alive) setAccountLedgerRows(Array.isArray(res) ? res : (res?.data ?? []));
        })
        .catch(() => {
          if (alive) setAccountLedgerRows([]);
        })
        .finally(() => {
          if (alive) setAccountLedgerLoading(false);
        });
      });
    return () => { alive = false; };
  }, [selectedMetalId, shopkeeperId, view]);

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
    return accountLedgerRows;
  }, [accountLedgerRows, ledgerOrder, ledgerRows]);

  const isLedgerLoading = ledgerOrder ? ledgerLoading : accountLedgerLoading;

  const describeLedgerRow = (row) => {
    if (row.entryType === "DELIVERY") {
      return {
        title: `${row.orderNumber ?? "Order"} — delivery`,
        detail: Number(row.debitFine ?? 0) > 0
          ? `${formatQuantity(row.debitFine)} fine`
          : row.description,
      };
    }

    if (row.entryType === "CASH_CONVERSION") {
      return {
        title: "Cash collection",
        detail: [
          row.cashAmount ? `₹ ${formatMoney(row.cashAmount)}` : null,
          row.metalRate ? `@ ${formatMoney(row.metalRate)}/10gm` : null,
          row.fineCredit ? `→ ${formatQuantity(row.fineCredit)} fine` : null,
        ].filter(Boolean).join("  "),
      };
    }

    if (row.entryType === "METAL_COLLECTION") {
      return {
        title: "Metal collection",
        detail: row.receivedQuantity
          ? `${formatQuantity(row.receivedQuantity)}  received`
          : row.description,
      };
    }

    return {
      title: row.description ?? row.entryType,
      detail: "",
    };
  };

  const ledgerPanel = (
    <Card className="khatabook-ledger">
      <div className="khatabook-ledger__header">
        <div>
          <h2>{ledgerOrder ? `Ledger - ${ledgerOrder.orderNumber}` : "Ledger"}</h2>
          <p>{ledgerOrder ? ledgerOrder.metal?.name : "Latest metal-wise khatabook movement"}</p>
        </div>
        <div className="khatabook-ledger__actions">
          {!ledgerOrder && (
            <select
              value={selectedMetalId}
              disabled={ledgerMetalsLoading}
              onChange={(event) => {
                setSelectedMetalId(event.target.value);
              }}
            >
              <option value="">All Metals</option>
              {ledgerMetals.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}
          {ledgerOrder && (
            <button type="button" onClick={() => setLedgerOrder(null)}>
              Show All
            </button>
          )}
        </div>
      </div>
      <div className="khatabook-ledger__table">
        <div className="khatabook-ledger__row khatabook-ledger__row--head">
          <span>Date</span>
          <span>Description</span>
          <span>Type</span>
          <span>Credit (gm fine)</span>
          <span>Balance (gm fine)</span>
        </div>
        {isLedgerLoading && (
          <div className="khatabook-ledger__shimmer">
            {Array.from({ length: 7 }).map((_, i) => (
              <div className="khatabook-ledger__shimmer-row" key={i}>
                <div className="khatabook-ledger__shimmer-cell">
                  <Skeleton w="72px" h={13} r={6} />
                  <Skeleton w="48px" h={10} r={5} />
                </div>
                <div className="khatabook-ledger__shimmer-cell">
                  <Skeleton w={`${70 + (i % 3) * 20}px`} h={13} r={6} />
                  <Skeleton w={`${90 + (i % 2) * 30}px`} h={10} r={5} />
                  {i % 2 === 0 && <Skeleton w="140px" h={10} r={5} />}
                </div>
                <div>
                  <Skeleton w="56px" h={22} r={999} />
                </div>
                <div>
                  <Skeleton w="64px" h={13} r={6} />
                </div>
                <div>
                  <Skeleton w="64px" h={13} r={6} />
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLedgerLoading && displayedLedgerRows.length === 0 && (
          <div className="khatabook-ledger__empty">No transactions found.</div>
        )}
        {!isLedgerLoading && displayedLedgerRows.map((row) => {
          const description = describeLedgerRow(row);
          const isCredit = row.entryType !== "DELIVERY";
          return (
            <div className={`khatabook-ledger__row${isCredit ? "" : " khatabook-ledger__row--debit"}`} key={row.id}>
              <span>
                <strong>{formatDate(row.entryDate)}</strong>
                <small>{formatTime(row.entryDate)}</small>
              </span>
              <span>
                <strong>{row.metal?.name ?? "—"}</strong>
                <small>{description.title}</small>
                {description.detail && <small className="khatabook-ledger__detail">{description.detail}</small>}
              </span>
              <span>
                <em className={`khatabook-ledger__type khatabook-ledger__type--${String(row.entryType).toLowerCase()}`}>
                  {row.entryType === "DELIVERY" ? "Delivery" : row.entryType === "CASH_CONVERSION" ? "Cash" : "Metal"}
                </em>
              </span>
              <span className={isCredit ? "khatabook-ledger__credit" : "khatabook-ledger__neutral"}>
                {isCredit && Number(row.creditFine ?? 0) > 0 ? `+ ${formatQuantity(row.creditFine)}` : "—"}
              </span>
              <span className="khatabook-ledger__balance">
                {formatQuantity(row.runningBalance)}
              </span>
            </div>
          );
        })}
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
            <button
              type="button"
              className="khatabook-toolbar__collection-btn"
              onClick={() => setQuickCollectionOpen(true)}
            >
              <Plus size={17} />
              Add Collection
            </button>
          </div>

          {creating && (
            <CreateKhatabookOrder
              defaultMetalId={selectedMetalId}
              initialSourceOrderId={initialSourceOrderId}
              metals={metals}
              shopkeeperId={shopkeeperId}
              onInitialSourceOrderPulled={onSourceOrderConsumed}
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
            shopName={shopName}
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
            onCollectionAdded?.();
          }}
        />
      )}

      {/* Toolbar-level quick collection — shopkeeper pre-locked */}
      {quickCollectionOpen && (
        <QuickCollectionModal
          shopkeeperId={shopkeeperId}
          shopName={shopName}
          onClose={() => setQuickCollectionOpen(false)}
          onSuccess={() => {
            setQuickCollectionOpen(false);
            refresh();
            onCollectionAdded?.();
          }}
        />
      )}
    </div>
  );
}
