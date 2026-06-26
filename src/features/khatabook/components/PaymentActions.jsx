import { X, Save } from "lucide-react";

export function PaymentActions({ onCancel, onSubmit, disabled }) {
  return (
    <div className="payment-actions">
      <button type="button" onClick={onCancel}>
        <X size={17} />
        Cancel
      </button>
      <button type="button" onClick={onSubmit} disabled={disabled}>
        <Save size={17} />
        Receive Payment
      </button>
    </div>
  );
}
