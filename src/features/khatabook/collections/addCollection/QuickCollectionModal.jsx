import { Info, Store, Wallet, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { khatabookService, metalService } from "../../../../services/resourceServices.js";
import { CashCollectionForm, calcConverted } from "./components/CashCollectionForm.jsx";
import { CollectionFooter } from "./components/CollectionFooter.jsx";
import { GramCollectionForm, calcFine } from "./components/GramCollectionForm.jsx";
import { MetalSelector } from "./components/MetalSelector.jsx";
import { rateUnitShort } from "./rateUnit.js";
import "./addCollection.scss";

const toNumber = (v) => (v === "" || v == null ? 0 : Number(v));
const fmt      = (n) => Number(n).toFixed(3);
const fmtMoney = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function CombinedCalc({ currentDue, advanceBalance, fine, cashAmount, cashRate, rateUnit = "PER_10G" }) {
  const due        = toNumber(currentDue);
  const existing   = toNumber(advanceBalance);
  const fineAmt    = toNumber(fine);
  const cashFine   = calcConverted(cashAmount, cashRate, rateUnit);
  const totalColl  = fineAmt + cashFine;
  const netDue     = Math.max(0, due - existing);
  const finalDue   = Math.max(0, netDue - totalColl);
  const newAdvance = Math.max(0, totalColl - netDue);
  const hasAny     = fineAmt > 0 || cashFine > 0;
  const isOverpay  = hasAny && totalColl > netDue;

  return (
    <div className="collection-modal__calc-box">
      {existing > 0 && (
        <div className="collection-modal__calc-row calc-advance-existing">
          <span>Advance on account</span>
          <span className="calc-advance">+ {fmt(existing)} gm</span>
        </div>
      )}
      <div className="collection-modal__calc-row">
        <span>Current Due</span>
        <span className={netDue > 0 ? "calc-due" : "calc-clear"}>{fmt(netDue)} gm</span>
      </div>
      {fineAmt > 0 && (
        <div className="collection-modal__calc-row">
          <span>Fine collected</span>
          <span className="calc-collected">− {fmt(fineAmt)} gm</span>
        </div>
      )}
      {cashFine > 0 && (
        <div className="collection-modal__calc-row">
          <span>
            Cash collected
            <span className="calc-cash-detail">
              &nbsp;{fmtMoney(cashAmount)} × {fmtMoney(cashRate)}{rateUnitShort(rateUnit)}
            </span>
          </span>
          <span className="calc-collected">− {fmt(cashFine)} gm</span>
        </div>
      )}
      <div className="collection-modal__calc-divider" />
      {isOverpay ? (
        <>
          <div className="collection-modal__calc-row collection-modal__calc-total">
            <span>Final Due</span>
            <span className="calc-settled">0.000 gm</span>
          </div>
          <div className="collection-modal__calc-row calc-advance-row">
            <span>Advance Deposit</span>
            <span className="calc-advance">+ {fmt(newAdvance)} gm</span>
          </div>
          <div className="collection-modal__calc-hint">
            The extra {fmt(newAdvance)} gm will be stored as an advance and applied to the next order.
          </div>
        </>
      ) : (
        <div className="collection-modal__calc-row collection-modal__calc-total">
          <span>Final Due</span>
          <span className={!hasAny ? "calc-placeholder" : finalDue > 0 ? "calc-final-due" : "calc-settled"}>
            {hasAny ? `${fmt(finalDue)} gm` : "—"}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * QuickCollectionModal — same form as AddCollectionModal but with the shopkeeper
 * pre-locked. Used when already inside a shopkeeper's Khatabook section.
 */
export function QuickCollectionModal({ shopkeeperId, shopName, onClose, onSuccess }) {
  const [metals, setMetals]                   = useState([]);
  const [selectedMetalId, setSelectedMetalId] = useState("");
  const [metalsLoading, setMetalsLoading]     = useState(false);
  const [gramForm, setGramForm]               = useState({ weight: "" });
  const [cashForm, setCashForm]               = useState({ cashAmount: "", metalRate: "" });
  const [notes, setNotes]                     = useState("");
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState("");

  // Load metals for this shopkeeper on mount.
  // Also fetch global metals to get rateUnit (khatabook endpoint may not include it).
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
        const list = khataRes.data ?? khataRes ?? [];
        const globalMetals = globalRes.data ?? [];
        const rateUnitMap = new Map(globalMetals.map((m) => [String(m.id), m.rateUnit ?? "PER_10G"]));
        const enriched = list.map((r) => ({
          ...r,
          metal: { ...r.metal, rateUnit: rateUnitMap.get(String(r.metal.id)) ?? r.metal.rateUnit ?? "PER_10G" },
        }));
        setMetals(enriched);
        if (enriched[0]) setSelectedMetalId(String(enriched[0].metal.id));
      })
      .catch(() => { if (alive) setMetals([]); })
      .finally(() => { if (alive) setMetalsLoading(false); });
    return () => { alive = false; };
  }, [shopkeeperId]);

  const updateGram = useCallback((key, val) => {
    setGramForm((f) => ({ ...f, [key]: val }));
    setError("");
  }, []);

  const updateCash = useCallback((key, val) => {
    setCashForm((f) => ({ ...f, [key]: val }));
    setError("");
  }, []);

  const selectedMetal  = useMemo(
    () => metals.find((r) => String(r.metal.id) === String(selectedMetalId)),
    [metals, selectedMetalId],
  );
  const currentRate    = selectedMetal?.currentRate ?? selectedMetal?.metal?.currentRate ?? null;
  const metalTunch     = selectedMetal?.metal?.tunch ?? 100;
  const metalName      = selectedMetal?.metal?.name ?? "Metal";
  const rateUnit       = selectedMetal?.metal?.rateUnit ?? "PER_10G";
  const currentDue     = selectedMetal?.outstandingDue ?? selectedMetal?.ledgerBalance ?? 0;
  const advanceBalance = selectedMetal?.advanceBalance ?? 0;

  const fine     = calcFine(gramForm.weight, metalTunch);
  const cashRate = toNumber(cashForm.metalRate) || toNumber(currentRate);
  const cashFine = calcConverted(cashForm.cashAmount, cashRate, rateUnit);

  const isValid = useMemo(
    () => !!selectedMetalId && (fine > 0 || cashFine > 0),
    [selectedMetalId, fine, cashFine],
  );

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      if (fine > 0) {
        await khatabookService.createMetalCollection({
          shopkeeperId:     Number(shopkeeperId),
          metalId:          Number(selectedMetalId),
          receivedQuantity: fine,
          notes:            notes.trim() || undefined,
        });
      }
      if (cashFine > 0) {
        await khatabookService.createCashCollection({
          shopkeeperId: Number(shopkeeperId),
          metalId:      Number(selectedMetalId),
          cashAmount:   toNumber(cashForm.cashAmount),
          metalRate:    cashRate,
          notes:        notes.trim() || undefined,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.userMessage ||
        err.message ||
        "Failed to add collection.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="collection-modal__overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="collection-modal">

        {/* Header */}
        <div className="collection-modal__header">
          <div className="collection-modal__header-left">
            <div className="collection-modal__header-icon">
              <Wallet size={26} />
            </div>
            <div className="collection-modal__header-copy">
              <h2>Add Collection</h2>
              <p>Add metal or cash collection for this shopkeeper.</p>
            </div>
          </div>
          <button type="button" className="collection-modal__close" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Locked shop banner */}
        <div className="quick-collection__shop-banner">
          <Store size={14} />
          <span className="quick-collection__shop-name">{shopName ?? `Shopkeeper #${shopkeeperId}`}</span>
          <span className="quick-collection__shop-tag">Auto-selected</span>
        </div>

        {/* Collection details */}
        <div className="collection-modal__details">
          <div className="collection-modal__details-title">Collection Details</div>

          {metalsLoading ? (
            <div className="quick-collection__loading">Loading metals…</div>
          ) : (
            <MetalSelector
              metals={metals}
              selectedMetalId={selectedMetalId}
              onSelect={setSelectedMetalId}
              currentRate={currentRate}
              rateUnit={rateUnit}
            />
          )}

          {selectedMetalId && !metalsLoading && (
            <>
              <div className="collection-modal__dual-form">
                <div className="collection-modal__form-section">
                  <div className="collection-modal__form-section-label">Metal (Gram)</div>
                  <div className="collection-modal__form collection-modal__form--inner">
                    <GramCollectionForm form={gramForm} onChange={updateGram} metalTunch={metalTunch} />
                  </div>
                </div>

                <div className="collection-modal__form-divider" />

                <div className="collection-modal__form-section">
                  <div className="collection-modal__form-section-label">Cash</div>
                  <div className="collection-modal__form collection-modal__form--inner">
                    <CashCollectionForm form={cashForm} onChange={updateCash} currentRate={currentRate} rateUnit={rateUnit} />
                  </div>
                </div>
              </div>

              <div className="collection-modal__field collection-modal__calc-field">
                <label className="collection-modal__label">Final Calculation</label>
                <CombinedCalc
                  currentDue={currentDue}
                  advanceBalance={advanceBalance}
                  fine={fine}
                  cashAmount={cashForm.cashAmount}
                  cashRate={cashRate}
                  rateUnit={rateUnit}
                />
              </div>

              <div className="collection-modal__field collection-modal__notes-field">
                <label className="collection-modal__label">Notes (optional)</label>
                <textarea
                  className="collection-modal__textarea"
                  placeholder="Add a note for this collection..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="collection-modal__info">
                <Info size={15} />
                Collection will be added to the {metalName} account.
              </div>
            </>
          )}
        </div>

        {error && <div className="collection-modal__error">{error}</div>}

        <CollectionFooter
          onCancel={onClose}
          onSubmit={submit}
          submitting={submitting}
          disabled={!isValid}
        />
      </div>
    </div>
  );
}
