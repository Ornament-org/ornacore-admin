import { formatMoney } from "../../../components/khatabookFormatters.js";

const toNumber = (v) => (v === "" || v == null ? 0 : Number(v));

export const calcConverted = (cash, rate) => {
  const c = toNumber(cash);
  const r = toNumber(rate);
  return c > 0 && r > 0 ? (c / r) * 10 : 0;
};

export function CashCollectionForm({ form, onChange, currentRate }) {
  const rate      = form.metalRate || currentRate || "";
  const converted = calcConverted(form.cashAmount, rate);

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
          Rate (per 10 gm) <span>*</span>
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
            Using market rate {formatMoney(currentRate)}
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
