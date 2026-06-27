import { ChevronDown, ChevronUp, Gem } from "lucide-react";
import { ExpandedOrderCard } from "./ExpandedOrderCard.jsx";
import { formatQuantity, formatTime, humanStatus } from "./khatabookFormatters.js";

// BUG-3: pass collection handlers down to ExpandedOrderCard
export function KhatabookOrderRow({ order, expanded, onToggle, onViewLedger, onAddMetalCollection, onAddCashCollection }) {
  const date = new Date(order.entryDate);
  const dueIsClear = Number(order.orderDue ?? order.outstandingDue) <= 0;

  return (
    <article className={expanded ? "khatabook-order is-expanded" : "khatabook-order"}>
      <button className="khatabook-order__summary" type="button" onClick={onToggle}>
        <time className="khatabook-order__date" dateTime={order.entryDate}>
          <span>{date.toLocaleString("en-IN", { month: "short" })}</span>
          <strong>{date.toLocaleString("en-IN", { day: "2-digit" })}</strong>
          <span>{date.getFullYear()}</span>
          <small>{formatTime(order.entryDate)}</small>
        </time>
        <span className="khatabook-order__identity">
          <strong>Order #{order.orderNumber}</strong>
          <em>
            <Gem size={16} />
            {order.metal?.name ?? "Metal"}
          </em>
          <small>Note: {order.notes || "Regular delivery"}</small>
        </span>
        <div className="khatabook-order__metrics">
          <span className="khatabook-order__metric">
            <small>Fine Delivered</small>
            <strong>{formatQuantity(order.fineDelivered)}</strong>
          </span>
          <span className="khatabook-order__metric">
            <small>Credit Applied</small>
            <strong>{formatQuantity(order.orderSummary?.collectionApplied ?? order.creditReceived)}</strong>
          </span>
          <span className="khatabook-order__metric">
            <small>Order Due</small>
            <strong className={dueIsClear ? "is-clear" : "is-due"}>
              {formatQuantity(order.orderDue ?? order.outstandingDue)}
            </strong>
          </span>
        </div>
        <span className="khatabook-order__status">
          {humanStatus(order.status)}
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {expanded && (
        <ExpandedOrderCard
          order={order}
          onViewLedger={onViewLedger}
          onAddMetalCollection={onAddMetalCollection}
          onAddCashCollection={onAddCashCollection}
        />
      )}
    </article>
  );
}
