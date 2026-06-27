import { formatMoney, formatQuantity } from "./khatabookFormatters.js";

export function CollectionSection({ order }) {
  const metalCollections = (order.collections ?? []).filter((row) => row.collectionType === "METAL");
  const cashCollections = (order.collections ?? []).filter((row) => row.collectionType === "CASH");
  const metalReceived = metalCollections.reduce((sum, row) => sum + Number(row.receivedQuantity ?? 0), 0);
  const cashReceived = cashCollections.reduce((sum, row) => sum + Number(row.cashAmount ?? 0), 0);
  const cashFine = cashCollections.reduce((sum, row) => sum + Number(row.fineCredit ?? 0), 0);
  const latestRate = [...cashCollections].reverse().find((row) => row.metalRate)?.metalRate;

  return (
    <section className="khatabook-section khatabook-section--green">
      <h3>Collections</h3>
      <div className="khatabook-lines">
        <div>
          <span>{order.metal?.name ?? "Metal"} Received</span>
          <strong>{formatQuantity(metalReceived)}</strong>
        </div>
        <div>
          <span>Cash Received</span>
          <strong>{formatMoney(cashReceived)}</strong>
        </div>
        <div>
          <span>{order.metal?.name ?? "Metal"} Rate</span>
          <strong>{latestRate ? formatMoney(latestRate) : "—"}</strong>
        </div>
        <div>
          <span>Cash Converted To Fine {order.metal?.name ?? "Metal"}</span>
          <strong>{formatQuantity(cashFine)}</strong>
        </div>
      </div>
      <div className="khatabook-section__total">
        <span>Applied To This Order</span>
        <strong>{formatQuantity(order.orderSummary?.collectionApplied ?? order.creditReceived)}</strong>
      </div>
    </section>
  );
}
