const toNumber = (v) => (v === "" || v == null ? 0 : Number(v));

export const calcFine = (weight, tunch) => {
  const w = toNumber(weight);
  const t = toNumber(tunch) || 100;
  return w > 0 ? (w * t) / 100 : 0;
};

export function GramCollectionForm({ form, onChange, metalTunch }) {
  const fine = calcFine(form.weight, metalTunch);

  return (
    <>
      <div className="collection-modal__field">
        <label className="collection-modal__label">
          Weight (Gram) <span>*</span>
        </label>
        <div className="collection-modal__input-wrap">
          <input
            type="number"
            min="0"
            step="0.001"
            className="collection-modal__input"
            placeholder="Enter gross weight"
            value={form.weight}
            onChange={(e) => onChange("weight", e.target.value)}
          />
          <span className="collection-modal__input-suffix">gm</span>
        </div>
      </div>

      <div className="collection-modal__field">
        <label className="collection-modal__label">Fine Metal</label>
        <div className="collection-modal__input-wrap">
          <input readOnly className="collection-modal__input" value={fine.toFixed(3)} />
          <span className="collection-modal__input-suffix collection-modal__fine-value">gm</span>
        </div>
      </div>
    </>
  );
}
