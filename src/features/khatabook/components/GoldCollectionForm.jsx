import { Card } from "../../../components/common/Card.jsx";
import { formatQuantity } from "./khatabookFormatters.js";

export function GoldCollectionForm({ value, onChange, note, onNoteChange }) {
  return (
    <Card className="gold-collection-form">
      <h3>Payment Details</h3>
      <label>
        <span>Gold Received (gm) *</span>
        <input
          type="number"
          min="0"
          step="0.001"
          placeholder="0.000"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      {value && (
        <div className="gold-collection-form__preview">
          <span>{formatQuantity(value)} will be added as credit</span>
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
