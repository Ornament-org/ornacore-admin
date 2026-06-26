import { Scale } from "lucide-react";

export function CreditLimitsCard({ limits = [] }) {
  return (
    <div className="sd-info-card">
      <div className="sd-info-card__header">
        <div className="sd-info-card__icon">
          <Scale size={18} />
        </div>
        <h2 className="sd-info-card__title">Metal Credit Limits</h2>
      </div>

      {limits.length ? (
        <div className="sd-credit-list">
          {limits.map((limit) => (
            <div className="sd-credit-row" key={limit.id ?? limit.metalId}>
              <span className="sd-credit-row__metal">
                {limit.metal?.name ?? `Metal #${limit.metalId}`}
              </span>
              <div className="sd-credit-row__right">
                <span className="sd-credit-row__limit">
                  {limit.creditLimitGrams ?? "0.000"} g limit
                </span>
                {Number(limit.advanceBalance ?? 0) > 0 && (
                  <span className="sd-credit-row__advance">
                    + {limit.advanceBalance} g advance
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="shopkeeper-details__state shopkeeper-details__state--compact">
          No credit limits configured.
        </div>
      )}
    </div>
  );
}
