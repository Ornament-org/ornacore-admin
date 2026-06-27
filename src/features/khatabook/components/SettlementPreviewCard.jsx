import { Card } from "../../../components/common/Card.jsx";
import { formatDate, formatQuantity } from "./khatabookFormatters.js";

// BUG-13 fix: align field names with the actual backend settlement shape.
//
// There is currently no /collection-preview endpoint (BUG-2 removed the call from
// AddReceivedPaymentPage). This component is kept for future use but is NOT rendered
// anywhere in the app right now.
//
// Expected `preview` shape (based on khatabook.service.js mapSettlement):
// {
//   fineCredit:      string   — total fine weight credited
//   outstandingDue:  string   — outstanding due after this settlement (if returned)
//   settlements: [{
//     orderId:       number
//     orderNumber:   string
//     entryDate:     string
//     appliedFine:   string   — fine weight applied to this order
//     totalFineCredit: string — total fine weight from the collection
//   }]
// }

export function SettlementPreviewCard({ preview }) {
  return (
    <Card className="settlement-preview">
      <h3>How it will be settled (FIFO)</h3>
      <div className="settlement-preview__total">
        <span>Total Credit to be Added</span>
        {/* BUG-13: was preview?.totalCredit — correct field is fineCredit */}
        <strong className="is-green">{formatQuantity(preview?.fineCredit)}</strong>
      </div>
      <p className="settlement-preview__description">
        This payment will be adjusted automatically against oldest dues.
      </p>
      <div className="settlement-preview__orders">
        {preview?.settlements?.map((settlement) => (
          <div key={settlement.orderId} className="settlement-preview__order">
            <div className="settlement-preview__order-header">
              <strong>Order #{settlement.orderNumber}</strong>
              {/* BUG-13: was settlement.orderDate — correct field is entryDate */}
              <span>{formatDate(settlement.entryDate)}</span>
            </div>
            <div className="settlement-preview__order-details">
              <span>Applied Credit</span>
              {/* BUG-13: was settlement.appliedCredit — correct field is appliedFine */}
              <strong>{formatQuantity(settlement.appliedFine)}</strong>
            </div>
          </div>
        ))}
      </div>
      {preview?.outstandingDue != null && (
        <div className="settlement-preview__after">
          <span>After this payment</span>
          <div>
            <span>Total Outstanding Due</span>
            <strong className="is-red">{formatQuantity(preview.outstandingDue)}</strong>
          </div>
        </div>
      )}
      <p className="settlement-preview__info">
        Collections are adjusted against the oldest outstanding dues first (FIFO).
      </p>
    </Card>
  );
}
