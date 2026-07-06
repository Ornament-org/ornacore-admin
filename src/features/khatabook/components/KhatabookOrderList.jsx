import { KhatabookOrderRow } from "./KhatabookOrderRow.jsx";

// BUG-3: accept and forward collection handlers
export function KhatabookOrderList({
  orders = [],
  expandedOrderId,
  onToggleOrder,
  onViewLedger,
  onAddMetalCollection,
  onAddCashCollection,
  shopName,
}) {
  if (!orders.length) {
    return <div className="khatabook-empty">No khatabook orders found for this selection.</div>;
  }

  return (
    <div className="khatabook-orders">
      {orders.map((order) => (
        <KhatabookOrderRow
          expanded={String(expandedOrderId ?? "") === String(order.id)}
          key={order.id}
          order={order}
          onToggle={() => onToggleOrder(order.id)}
          onViewLedger={onViewLedger}
          onAddMetalCollection={onAddMetalCollection}
          onAddCashCollection={onAddCashCollection}
          shopName={shopName}
        />
      ))}
    </div>
  );
}
