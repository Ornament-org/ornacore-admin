import { CreditCard, Gem, ReceiptText } from "lucide-react";
import { CollectionSection } from "./CollectionSection.jsx";
import { DeliveredItemsSection } from "./DeliveredItemsSection.jsx";
import { DueSummarySection } from "./DueSummarySection.jsx";
import { formatDate, formatQuantity } from "./khatabookFormatters.js";

export function ExpandedOrderCard({ order, onViewLedger }) {
  return (
    <div className="khatabook-expanded">
      <div className="khatabook-expanded__grid">
        <DeliveredItemsSection order={order} />
        <CollectionSection order={order} />
        <DueSummarySection order={order} />
      </div>
      {order.settlementBreakdown?.length > 0 && (
        <section className="khatabook-section khatabook-section--settlements">
          <h3>FIFO Settlement Breakdown</h3>
          <div className="khatabook-table">
            <div className="khatabook-table__head">
              <span>Collection</span>
              <span>Source</span>
              <span>Applied</span>
              <span>Date</span>
            </div>
            {order.settlementBreakdown.map((row) => (
              <div className="khatabook-table__row" key={row.id}>
                <span>#{row.collectionId}</span>
                <span>{row.source === "ORDER_CREATION" ? "At order creation" : "Later collection"}</span>
                <strong>{formatQuantity(row.appliedFine)}</strong>
                <span>{row.collectionDate ? formatDate(row.collectionDate) : "—"}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      <div className="khatabook-actions">
        <button type="button">
          <Gem size={17} />
          Add {order.metal?.name ?? "Metal"} Collection
        </button>
        <button type="button">
          <CreditCard size={17} />
          Add Cash Collection
        </button>
        <button type="button" onClick={() => onViewLedger(order)}>
          <ReceiptText size={17} />
          View Full Ledger
        </button>
      </div>
    </div>
  );
}
