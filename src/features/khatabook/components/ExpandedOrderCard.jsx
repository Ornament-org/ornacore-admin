import { CreditCard, Gem, ReceiptText } from "lucide-react";
import { formatDate, formatMoney, formatQuantity } from "./khatabookFormatters.js";

// BUG-3: added onAddMetalCollection and onAddCashCollection props
export function ExpandedOrderCard({ order, onViewLedger, onAddMetalCollection, onAddCashCollection }) {
  const metalName = order.metal?.name ?? "Metal";
  const cs = order.collectionSummary ?? {};
  const creditApplied = cs.collectionAppliedToThisOrder ?? order.orderSummary?.collectionApplied ?? order.creditReceived ?? 0;
  const oldDue = order.oldDue ?? order.priorOutstandingDue ?? order.metalAccount?.priorDue ?? null;
  const orderDue = order.orderDue ?? order.outstandingDue ?? 0;
  const totalMetalDue = order.metalAccount?.totalOutstandingDue ?? order.metalDue ?? 0;
  const dueIsClear = Number(orderDue) <= 0;

  const hasMetalApplied = Number(cs.metalApplied ?? 0) > 0;
  const hasCashApplied  = Number(cs.cashApplied  ?? 0) > 0;

  return (
    <div className="order-invoice">

      {/* ── ITEMS DELIVERED ─────────────────────────────────────────────── */}
      <section className="order-invoice__section order-invoice__section--items">
        <header className="order-invoice__section-label">Items Delivered</header>
        <table className="order-invoice__table order-invoice__table--items">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Gross Weight</th>
              <th>Tunch / Purity</th>
              <th>Fine Weight</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item) => (
              <tr key={item.id}>
                <td data-label="Item Name">{item.itemName}</td>
                <td data-label="Gross Wt">{formatQuantity(item.grossWeight)}</td>
                <td data-label="Tunch">{Number(item.tunch).toLocaleString("en-IN")}</td>
                <td data-label="Fine Wt">{formatQuantity(item.fineWeight)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="order-invoice__subtotal order-invoice__subtotal--gold">
          <span>Total Fine Delivered</span>
          <strong>{formatQuantity(order.fineDelivered)}</strong>
        </div>
      </section>

      <div className="order-invoice__divider" />

      {/* ── DUE BILLING ROWS ────────────────────────────────────────────── */}
      <section className="order-invoice__section">
        <div className="order-invoice__billing-rows">

          <div className="order-invoice__billing-row">
            <span>Collection Applied To This Order</span>
            <strong>{formatQuantity(creditApplied)}</strong>
          </div>

          {/* Metal breakdown sub-row */}
          {hasMetalApplied && (
            <div className="order-invoice__billing-row order-invoice__billing-row--sub">
              <span>↳ {metalName} (fine)</span>
              <span>{formatQuantity(cs.metalApplied)}</span>
            </div>
          )}

          {/* Cash breakdown sub-row: show INR value */}
          {hasCashApplied && (
            <div className="order-invoice__billing-row order-invoice__billing-row--sub">
              <span>↳ Cash</span>
              <span>{formatMoney(cs.cashApplied)}</span>
            </div>
          )}

          {Number(cs.collectionAppliedLater ?? 0) > 0 && (
            <div className="order-invoice__billing-row order-invoice__billing-row--muted">
              <span>  (incl. {formatQuantity(cs.collectionAppliedLater)} fine applied later)</span>
              <span />
            </div>
          )}

          {oldDue !== null && (
            <div className="order-invoice__billing-row">
              <span>Old Due</span>
              <strong>{formatQuantity(oldDue)}</strong>
            </div>
          )}
        </div>

        <div className={`order-invoice__subtotal order-invoice__subtotal--due${dueIsClear ? " order-invoice__subtotal--clear" : ""}`}>
          <span>Order Due</span>
          <strong>{formatQuantity(orderDue)}</strong>
        </div>

        <div className="order-invoice__subtotal order-invoice__subtotal--total">
          <span>Total {metalName} Due</span>
          <strong>{formatQuantity(totalMetalDue)}</strong>
        </div>
      </section>

      {/* ── FIFO SETTLEMENT ─────────────────────────────────────────────── */}
      {(order.settlementBreakdown?.length ?? 0) > 0 && (
        <>
          <div className="order-invoice__divider" />
          <section className="order-invoice__section">
            <header className="order-invoice__section-label">FIFO Settlement Breakdown</header>
            <table className="order-invoice__table order-invoice__table--settlement">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Received</th>
                  <th>Applied (this order)</th>
                  <th>Source</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {order.settlementBreakdown.map((row) => {
                  const isCash = row.collectionType === "CASH";
                  const receivedCell = isCash
                    ? `${formatMoney(row.cashAmount)} @ ${formatMoney(row.metalRate)}/10gm`
                    : row.receivedQuantity != null
                      ? `${formatQuantity(row.receivedQuantity)} fine`
                      : "—";
                  const appliedCell = isCash
                    ? `${formatMoney(row.appliedCash)} ≈ ${formatQuantity(row.appliedFine)}`
                    : `${formatQuantity(row.appliedFine)} fine`;

                  return (
                    <tr key={row.id}>
                      <td>#{row.collectionId}</td>
                      <td>{isCash ? "Cash" : metalName}</td>
                      <td>{receivedCell}</td>
                      <td className="order-invoice__applied">{appliedCell}</td>
                      <td>{row.source === "ORDER_CREATION" ? "At creation" : "Later"}</td>
                      <td>{row.collectionDate ? formatDate(row.collectionDate) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </>
      )}

      {/* ── FOOTER ACTIONS ──────────────────────────────────────────────── */}
      {/* <div className="order-invoice__footer">
        <button
          type="button"
          className="order-invoice__btn"
          onClick={() => onAddMetalCollection?.(order)}
        >
          <Gem size={15} />
          Add {metalName} Collection
        </button>
        <button
          type="button"
          className="order-invoice__btn"
          onClick={() => onAddCashCollection?.(order)}
        >
          <CreditCard size={15} />
          Add Cash Collection
        </button>
        <button type="button" className="order-invoice__btn" onClick={() => onViewLedger?.(order)}>
          <ReceiptText size={15} />
          View Full Ledger
        </button>
      </div> */}

    </div>
  );
}
