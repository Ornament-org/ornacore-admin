import { AlertTriangle, Banknote, Gem, Store, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { khatabookService, metalService } from "../../../services/resourceServices.js";
import { MetalSelector } from "../collections/addCollection/components/MetalSelector.jsx";
import "../collections/addCollection/addCollection.scss";

const toNumber = (value) => (value === "" || value == null ? 0 : Number(value));
const today = () => new Date().toISOString().slice(0, 10);

const DUE_COPY = {
  cash: {
    title: "Add Due Cash",
    description: "Add cash due directly to this shopkeeper account.",
    amountLabel: "Cash due",
    placeholder: "0",
    suffix: "INR",
    button: "Add Cash Due",
    Icon: Banknote,
  },
  metal: {
    title: "Add Due Metal",
    description: "Add metal due directly to this shopkeeper account.",
    amountLabel: "Metal due",
    placeholder: "0.000",
    suffix: "gm",
    button: "Add Metal Due",
    Icon: Gem,
  },
};

export function QuickDueModal({ type = "metal", shopkeeperId, shopName, onClose, onSuccess }) {
  const copy = DUE_COPY[type] ?? DUE_COPY.metal;
  const HeaderIcon = copy.Icon;

  const [metals, setMetals] = useState([]);
  const [selectedMetalId, setSelectedMetalId] = useState("");
  const [metalsLoading, setMetalsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [entryDate, setEntryDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shopkeeperId) return;
    let alive = true;
    setMetalsLoading(true);
    Promise.all([
      khatabookService.metals(shopkeeperId),
      metalService.list({ isActive: true, pageSize: 100 }),
    ])
      .then(([khataRes, globalRes]) => {
        if (!alive) return;
        const accountRows = khataRes.data ?? khataRes ?? [];
        const globalMetals = globalRes.data ?? [];
        const accountMap = new Map(accountRows.map((row) => [String(row.metal.id), row]));
        const merged = globalMetals.map((metal) => {
          const account = accountMap.get(String(metal.id));
          return {
            ...(account ?? {}),
            metal: {
              ...(account?.metal ?? {}),
              ...metal,
              rateUnit: metal.rateUnit ?? account?.metal?.rateUnit ?? "PER_10G",
            },
          };
        });
        setMetals(merged);
        if (merged[0]) setSelectedMetalId(String(merged[0].metal.id));
      })
      .catch(() => {
        if (alive) setMetals([]);
      })
      .finally(() => {
        if (alive) setMetalsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [shopkeeperId]);

  const selectedMetal = useMemo(
    () => metals.find((row) => String(row.metal.id) === String(selectedMetalId)),
    [metals, selectedMetalId],
  );
  const currentRate = selectedMetal?.currentRate ?? selectedMetal?.metal?.currentRate ?? null;
  const rateUnit = selectedMetal?.metal?.rateUnit ?? "PER_10G";
  const metalName = selectedMetal?.metal?.name ?? "Metal";
  const amountNumber = toNumber(amount);
  const isValid = Boolean(selectedMetalId) && amountNumber > 0;

  const updateAmount = useCallback((value) => {
    setAmount(value);
    setError("");
  }, []);

  const submit = async () => {
    if (!isValid) return;
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        shopkeeperId: Number(shopkeeperId),
        metalId: Number(selectedMetalId),
        entryDate,
        notes: notes.trim() || undefined,
      };
      if (type === "cash") {
        await khatabookService.createCashDue({
          ...payload,
          cashAmount: amountNumber,
        });
      } else {
        await khatabookService.createMetalDue({
          ...payload,
          dueQuantity: amountNumber,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.userMessage ||
          err.message ||
          "Failed to add due.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="collection-modal__overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="collection-modal collection-modal--compact">
        <div className="collection-modal__header">
          <div className="collection-modal__header-left">
            <div className="collection-modal__header-icon">
              <HeaderIcon size={26} />
            </div>
            <div className="collection-modal__header-copy">
              <h2>{copy.title}</h2>
              <p>{copy.description}</p>
            </div>
          </div>
          <button type="button" className="collection-modal__close" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="quick-collection__shop-banner">
          <Store size={14} />
          <span className="quick-collection__shop-name">{shopName ?? `Shopkeeper #${shopkeeperId}`}</span>
          <span className="quick-collection__shop-tag">Account due</span>
        </div>

        <div className="collection-modal__details">
          <div className="collection-modal__details-title">Due Details</div>

          {metalsLoading ? (
            <div className="quick-collection__loading">Loading metals...</div>
          ) : (
            <MetalSelector
              metals={metals}
              selectedMetalId={selectedMetalId}
              onSelect={setSelectedMetalId}
              currentRate={currentRate}
              rateUnit={rateUnit}
            />
          )}

          <div className="collection-modal__form">
            <label className="collection-modal__field">
              <span className="collection-modal__label">
                {copy.amountLabel}
                <span>*</span>
              </span>
              <span className="collection-modal__input-wrap">
                <input
                  className="collection-modal__input"
                  type="number"
                  min="0"
                  step={type === "cash" ? "1" : "0.001"}
                  placeholder={copy.placeholder}
                  value={amount}
                  onChange={(event) => updateAmount(event.target.value)}
                />
                <span className="collection-modal__input-suffix">{copy.suffix}</span>
              </span>
            </label>

            <label className="collection-modal__field">
              <span className="collection-modal__label">Entry date</span>
              <input
                className="collection-modal__input"
                type="date"
                value={entryDate}
                onChange={(event) => setEntryDate(event.target.value)}
              />
            </label>
          </div>

          <div className="collection-modal__field collection-modal__notes-field">
            <label className="collection-modal__label">Notes (optional)</label>
            <textarea
              className="collection-modal__textarea"
              placeholder="Add a note for this due..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <div className="collection-modal__info">
            <AlertTriangle size={15} />
            {copy.title} will be added to the {metalName} account without creating a new delivery order.
          </div>
        </div>

        {error && <div className="collection-modal__error">{error}</div>}

        <div className="collection-modal__footer">
          <button type="button" className="collection-modal__cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="collection-modal__submit-btn"
            disabled={!isValid || submitting}
            onClick={submit}
          >
            {submitting ? "Adding..." : copy.button}
          </button>
        </div>
      </div>
    </div>
  );
}
