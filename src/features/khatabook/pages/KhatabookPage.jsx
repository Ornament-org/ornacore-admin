import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "../../../components/common/Card.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { khatabookService } from "../../../services/resourceServices.js";
import { CreateKhatabookOrder } from "../components/CreateKhatabookOrder.jsx";
import { KhatabookFilters } from "../components/KhatabookFilters.jsx";
import { KhatabookOrderList } from "../components/KhatabookOrderList.jsx";
import { MetalDueCards } from "../components/MetalDueCards.jsx";
import { formatDate, formatQuantity } from "../components/khatabookFormatters.js";
import { SkeletonKhatabook } from "../../../components/skeleton/SkeletonKhatabook.jsx";
import "./Khatabook.scss";

export function KhatabookPage({ shopkeeperId, view = "orders" }) {
  const [metals, setMetals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ledgerOrder, setLedgerOrder] = useState(null);
  const [ledgerRows, setLedgerRows] = useState([]);
  const [selectedMetalId, setSelectedMetalId] = useState("");
  const [search, setSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([
      khatabookService.metals(shopkeeperId),
      khatabookService.orders(shopkeeperId, {
        metalId: selectedMetalId || undefined,
        search: search || undefined,
        pageSize: 50,
      }),
    ])
      .then(([metalResponse, orderResponse]) => {
        if (!alive) return;
        setMetals(metalResponse.data ?? []);
        setOrders(orderResponse.data ?? []);
        setError("");
      })
      .catch((requestError) => {
        if (!alive) return;
        setError(requestError.userMessage || requestError.message || "Unable to load khatabook.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [refreshKey, search, selectedMetalId, shopkeeperId]);

  const openLedger = useCallback((order) => {
    setLedgerOrder(order);
    khatabookService
      .orderLedger(order.id)
      .then((response) => setLedgerRows(response.data ?? []))
      .catch(() => setLedgerRows([]));
  }, []);

  const displayedLedgerRows = useMemo(() => {
    if (ledgerOrder) return ledgerRows;
    return orders.flatMap((order) => [
      {
        id: `order-${order.id}`,
        entryDate: order.entryDate,
        entryType: "DELIVERY",
        metal: order.metal,
        orderId: order.id,
        debitFine: order.fineDelivered,
        creditFine: "0.000",
        runningBalance: order.runningDue,
        description: `${order.orderNumber} delivery`,
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
  if (error) return <FormAlert>{error}</FormAlert>;

  return (
    <div className="khatabook">
      <MetalDueCards
        metals={metals}
        selectedMetalId={selectedMetalId}
        onSelectMetal={(metalId) => {
          setSelectedMetalId(metalId);
          setExpandedOrderId(null);
        }}
      />

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
                setRefreshKey((current) => current + 1);
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
            onToggleOrder={(orderId) => {
              setExpandedOrderId((current) => (String(current) === String(orderId) ? null : orderId));
            }}
            onViewLedger={openLedger}
          />
          {ledgerOrder && ledgerPanel}
        </>
      )}

      {view === "ledger" && ledgerPanel}
    </div>
  );
}
