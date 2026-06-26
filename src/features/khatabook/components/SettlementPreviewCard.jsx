import { Card } from "../../../components/common/Card.jsx";
import { formatDate, formatQuantity } from "./khatabookFormatters.js";

export function SettlementPreviewCard({ preview }) {
  return (
    <Card className="settlement-preview">
      <h3>How it will be settled (FIFO)</h3>
      <div className="settlement-preview__total">
        <span>Total Credit to be Added</span>
        <strong className="is-green">{formatQuantity(preview?.totalCredit)}</strong>
      </div>
      <p className="settlement-preview__description">
        This payment will be adjusted automatically against oldest dues.
      </p>
      <div className="settlement-preview__orders">
        {preview?.settlements?.map((settlement) => (
          <div key={settlement.orderId} className="settlement-preview__order">
            <div className="settlement-preview__order-header">
              <strong>Order #{settlement.orderNumber}</strong>
              <span>{formatDate(settlement.orderDate)}</span>
            </div>
            <div className="settlement-preview__order-details">
              <span>Previous Due</span>
              <strong>{formatQuantity(settlement.previousDue)}</strong>
              <span>This Payment</span>
              <strong>{formatQuantity(settlement.appliedCredit)}</strong>
              <span>Remaining Due</span>
              <strong>{formatQuantity(settlement.remainingDue)}</strong>
              <span>Status</span>
              <strong className={settlement.status === "SETTLED" ? "is-green" : "is-orange"}>
                {settlement.status === "SETTLED" ? "Settled" : "Partially Settled"}
              </strong>
            </div>
          </div>
        ))}
      </div>
      <div className="settlement-preview__after">
        <span>After this payment</span>
        <div>
          <span>Total Outstanding Due</span>
          <strong className="is-red">{formatQuantity(preview?.outstandingAfter)}</strong>
        </div>
      </div>
      <p className="settlement-preview__info">
        Collections are adjusted against the oldest outstanding dues first (FIFO).
      </p>
    </Card>
  );
}
