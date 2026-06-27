import { formatMoney } from "../../../components/khatabookFormatters.js";
import { rateUnitMultiplier, rateUnitShort } from "../rateUnit.js";

const toNumber = (v) => (v === "" || v == null ? 0 : Number(v));

export const calcConverted = (cash, rate, rateUnit = "PER_10G") => {
  const c = toNumber(cash);
  const r = toNumber(rate);
  if (c <= 0 || r <= 0) return 0;
  return (c / r) * rateUnitMultiplier(rateUnit);
};

export function CashCollectionForm({ form, onChange, currentRate, rateUnit = "PER_10G" }) {
  const rate      = form.metalRate || currentRate || "";
  const converted = calcConverted(form.cashAmount, rate, rateUnit);
  const unitShort = rateUnitShort(rateUnit);

  return (
    <>
      <div className="collection-modal__field">
        <label className="collection-modal__label">
          Cash Amount <span>*</span>
        </label>
        <div className="collection-modal__input-wrap">
          <input
            type="number"
            min="0"
            className="collection-modal__input"
            placeholder="Enter amount"
            value={form.cashAmount}
            onChange={(e) => onChange("cashAmount", e.target.value)}
          />
          <span className="collection-modal__input-suffix">₹</span>
        </div>
      </div>

      <div className="collection-modal__field">
        <label className="collection-modal__label">
          Rate ({unitShort}) <span>*</span>
        </label>
        <div className="collection-modal__input-wrap">
          <input
            type="number"
            min="0"
            className="collection-modal__input"
            placeholder={currentRate ? String(currentRate) : "e.g. 61250"}
            value={form.metalRate}
            onChange={(e) => onChange("metalRate", e.target.value)}
          />
          <span className="collection-modal__input-suffix">₹</span>
        </div>
        {currentRate && !form.metalRate && (
          <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
            Using market rate {formatMoney(currentRate)} {unitShort}
          </span>
        )}
      </div>

      <div className="collection-modal__field">
        <label className="collection-modal__label">Converted Fine</label>
        <div className="collection-modal__input-wrap">
          <input readOnly className="collection-modal__input" value={converted.toFixed(3)} />
          <span className="collection-modal__input-suffix collection-modal__fine-value">gm</span>
        </div>
      </div>
    </>
  );
}
