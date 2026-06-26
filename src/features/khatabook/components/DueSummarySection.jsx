import { formatQuantity } from "./khatabookFormatters.js";

export function DueSummarySection({ order }) {
  return (
    <section className="khatabook-section khatabook-section--due">
      <h3>Due Summary</h3>
      <div className="khatabook-lines">
        <div>
          <span>Order Fine Delivered</span>
          <strong>{formatQuantity(order.orderSummary?.fineDelivered ?? order.fineDelivered)}</strong>
        </div>
        <div>
          <span>Credit Applied To This Order</span>
          <strong>
            {formatQuantity(order.orderSummary?.collectionApplied ?? order.creditReceived)}
          </strong>
        </div>
        <div>
          <span>Collection Added At Creation</span>
          <strong>
            {formatQuantity(order.collectionSummary?.collectionAddedAtOrderCreation)}
          </strong>
        </div>
        <div>
          <span>Collection Applied Later</span>
          <strong>{formatQuantity(order.collectionSummary?.collectionAppliedLater)}</strong>
        </div>
      </div>
      <div className="khatabook-section__total khatabook-section__total--danger">
        <span>Order Due</span>
        <strong>{formatQuantity(order.orderDue ?? order.outstandingDue)}</strong>
      </div>
      <div className="khatabook-section__total">
        <span>Total {order.metal?.name ?? "Metal"} Due</span>
        <strong>{formatQuantity(order.metalAccount?.totalOutstandingDue ?? order.metalDue)}</strong>
      </div>
    </section>
  );
}
