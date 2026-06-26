import { Wallet, X } from "lucide-react";

export function CollectionHeader({ onClose }) {
  return (
    <div className="collection-modal__header">
      <div className="collection-modal__header-left">
        <div className="collection-modal__header-icon">
          <Wallet size={26} />
        </div>
        <div className="collection-modal__header-copy">
          <h2>Add Collection</h2>
          <p>Search and select a shop, then add metal or cash collection.</p>
        </div>
      </div>
      <button
        type="button"
        className="collection-modal__close"
        aria-label="Close"
        onClick={onClose}
      >
        <X size={18} />
      </button>
    </div>
  );
}
