import { Loader, Wallet } from "lucide-react";

export function CollectionFooter({ onCancel, onSubmit, submitting, disabled }) {
  return (
    <div className="collection-modal__footer">
      <button type="button" className="collection-modal__cancel-btn" onClick={onCancel}>
        Cancel
      </button>
      <button
        type="button"
        className="collection-modal__submit-btn"
        disabled={disabled || submitting}
        onClick={onSubmit}
      >
        {submitting ? (
          <>
            <Loader size={16} />
            Adding…
          </>
        ) : (
          <>
            <Wallet size={16} />
            Add Collection
          </>
        )}
      </button>
    </div>
  );
}
