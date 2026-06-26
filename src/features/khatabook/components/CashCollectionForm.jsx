import { Card } from "../../../components/common/Card.jsx";
import { formatMoney } from "./khatabookFormatters.js";

export function CashCollectionForm({ amount, onAmountChange, rate, onRateChange, note, onNoteChange, convertedValue }) {
  return (
    <Card className="cash-collection-form">
      <h3>Payment Details</h3>
      <label>
        <span>Cash Amount *</span>
        <input
          type="number"
          min="0"
          placeholder="₹0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
        />
      </label>
      <label>
        <span>Rate (₹ per 10 gm) *</span>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="₹50,000"
          value={rate}
          onChange={(e) => onRateChange(e.target.value)}
        />
      </label>
      {convertedValue && (
        <div className="cash-collection-form__preview">
          <span>Converted: {convertedValue} gm</span>
        </div>
      )}
      <label>
        <span>Payment Note (Optional)</span>
        <textarea
          placeholder="Enter note..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          maxLength={200}
        />
        <small>{note?.length || 0}/200</small>
      </label>
    </Card>
  );
}
