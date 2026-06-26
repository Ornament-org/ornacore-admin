import { Gem } from "lucide-react";
import { formatMoney, formatQuantity } from "./khatabookFormatters.js";

export function MetalDueCards({ metals = [], selectedMetalId, onSelectMetal }) {
  return (
    <div className="khatabook-due-cards">
      {metals.map((row) => {
        const selected = String(selectedMetalId ?? "") === String(row.metal.id);
        return (
          <button
            className={selected ? "khatabook-due-card is-selected" : "khatabook-due-card"}
            key={row.metal.id}
            type="button"
            onClick={() => onSelectMetal(selected ? "" : row.metal.id)}
          >
            <span className="khatabook-due-card__icon" aria-hidden="true">
              <Gem size={22} />
            </span>
            <span>
              <strong>{row.metal.name}</strong>
              <b>{formatQuantity(row.outstandingDue)}</b>
              <small>Due</small>
              <em>Credit limit {formatQuantity(row.creditLimit)}</em>
              <em>Ledger balance {formatQuantity(row.ledgerBalance)}</em>
              {row.value ? <em>{formatMoney(row.value)}</em> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
