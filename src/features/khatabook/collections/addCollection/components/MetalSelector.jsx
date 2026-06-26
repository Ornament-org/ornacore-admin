import { ChevronDown, Gem } from "lucide-react";
import { formatMoney } from "../../../components/khatabookFormatters.js";

export function MetalSelector({ metals, selectedMetalId, onSelect, currentRate }) {
  return (
    <div className="collection-modal__metal-row">
      <div>
        <div className="collection-modal__section-label">
          Select Metal <span>*</span>
        </div>
        <div className="collection-modal__metal-select-wrap">
          <Gem size={16} className="collection-modal__metal-icon" />
          <select
            value={selectedMetalId ?? ""}
            onChange={(e) => onSelect(e.target.value)}
          >
            <option value="">Select metal</option>
            {metals.map((row) => (
              <option key={row.metal.id} value={String(row.metal.id)}>
                {row.metal.name}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="collection-modal__metal-chevron" />
        </div>
      </div>

      {currentRate != null && (
        <div>
          <div className="collection-modal__metal-rate-label">Rate (per 10 gm)</div>
          <div className="collection-modal__metal-rate-box">
            <div className="collection-modal__metal-rate-value">
              {formatMoney(currentRate)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
