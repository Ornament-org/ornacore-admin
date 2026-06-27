import { Layers } from "lucide-react";
import { formatCurrency } from "../../../utils/formatters.js";
import "./DueOverview.scss";

export function DueOverview({ metalDues = [], cashDue = 0 }) {
  const hasCash = Number(cashDue) > 0;
  const visibleMetals = metalDues.length > 0 ? metalDues : [];

  return (
    <div className="due-overview">
      {visibleMetals.map((metal, i) => {
        const hasDue = Number(metal.dueGrams) > 0;
        return (
          <div key={metal.metalId ?? i} className="due-overview__group">
            <div className="due-overview__item">
              <span className="due-overview__label">
                <Layers size={10} />
                {metal.name} Due
              </span>
              <strong className={`due-overview__value${hasDue ? " due-overview__value--metal" : ""}`}>
                {Number(metal.dueGrams).toFixed(3)} gm
              </strong>
            </div>
            <div className="due-overview__divider" />
          </div>
        );
      })}

      {visibleMetals.length === 0 && (
        <div className="due-overview__group">
          <div className="due-overview__item due-overview__item--empty">
            <span className="due-overview__label">
              <Layers size={10} />
              Metal Due
            </span>
            <strong className="due-overview__value">—</strong>
          </div>
          <div className="due-overview__divider" />
        </div>
      )}

      <div className="due-overview__item">
        <span className="due-overview__label">
          <span className="due-overview__rupee">₹</span>
          Cash Due
        </span>
        <strong className={`due-overview__value${hasCash ? " due-overview__value--cash" : ""}`}>
          {formatCurrency(cashDue)}
        </strong>
      </div>
    </div>
  );
}
