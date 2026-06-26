import { Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { khatabookService, shopkeeperService } from "../../../../services/resourceServices.js";
import { CashCollectionForm, calcConverted } from "./components/CashCollectionForm.jsx";
import { CollectionFooter } from "./components/CollectionFooter.jsx";
import { CollectionHeader } from "./components/CollectionHeader.jsx";
import { GramCollectionForm, calcFine } from "./components/GramCollectionForm.jsx";
import { MetalSelector } from "./components/MetalSelector.jsx";
import { ShopSearchDropdown } from "./components/ShopSearchDropdown.jsx";
import "./addCollection.scss";

const toNumber = (v) => (v === "" || v == null ? 0 : Number(v));
const fmt = (n) => Number(n).toFixed(3);
const fmtMoney = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

function CombinedCalc({ currentDue, advanceBalance, fine, cashAmount, cashRate }) {
  const due           = toNumber(currentDue);
  const existing      = toNumber(advanceBalance);  // advance already on account
  const fineAmt       = toNumber(fine);
  const cashFine      = calcConverted(cashAmount, cashRate);
  const totalColl     = fineAmt + cashFine;
  const netDue        = Math.max(0, due - existing);   // effective current due
  const finalDue      = Math.max(0, netDue - totalColl);
  const newAdvance    = Math.max(0, totalColl - netDue); // excess becomes advance
  const hasAny        = fineAmt > 0 || cashFine > 0;
  const isOverpay     = hasAny && totalColl > netDue;

  return (
    <div className="collection-modal__calc-box">

      {/* Existing advance (if any) */}
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
              &nbsp;{fmtMoney(cashAmount)} X {fmtMoney(cashRate)}/10gm
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
            The extra {fmt(newAdvance)} gm will be stored as an advance and auto-applied to the next order.
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

export function AddCollectionModal({ onClose, onSuccess }) {
  // ── shop search ──────────────────────────────────────────────────────────────
  const [shopQuery, setShopQuery]       = useState("");
  const [shopResults, setShopResults]   = useState([]);
  const [shopLoading, setShopLoading]   = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  // ── metals ───────────────────────────────────────────────────────────────────
  const [metals, setMetals]                   = useState([]);
  const [selectedMetalId, setSelectedMetalId] = useState("");
  const [metalsLoading, setMetalsLoading]     = useState(false);

  // ── last payment ─────────────────────────────────────────────────────────────
  const [lastPayment, setLastPayment] = useState(null);

  // ── collection form ──────────────────────────────────────────────────────────
  const [gramForm, setGramForm] = useState({ weight: "" });
  const [cashForm, setCashForm] = useState({ cashAmount: "", metalRate: "" });
  const [notes, setNotes]       = useState("");

  // ── ui state ─────────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  const debounceRef = useRef(null);

  // ── load all shops on mount ──────────────────────────────────────────────────
  useEffect(() => {
    setShopLoading(true);
    shopkeeperService
      .list({ pageSize: 50 })
      .then((res) => setShopResults(res.data ?? res ?? []))
      .catch(() => setShopResults([]))
      .finally(() => setShopLoading(false));
  }, []);

  // ── debounced shop search ────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (shopQuery.trim() === "") {
      setShopLoading(true);
      shopkeeperService
        .list({ pageSize: 50 })
        .then((res) => setShopResults(res.data ?? res ?? []))
        .catch(() => setShopResults([]))
        .finally(() => setShopLoading(false));
      return;
    }
    setShopLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await shopkeeperService.list({ search: shopQuery, pageSize: 50 });
        setShopResults(res.data ?? res ?? []);
      } catch {
        setShopResults([]);
      } finally {
        setShopLoading(false);
      }
    }, 300);
  }, [shopQuery]);

  // ── load metals + last payment when shop is selected ─────────────────────────
  useEffect(() => {
    if (!selectedShop) {
      setMetals([]);
      setSelectedMetalId("");
      setLastPayment(null);
      return;
    }
    setMetalsLoading(true);
    Promise.all([
      khatabookService.metals(selectedShop.id),
      khatabookService.orders(selectedShop.id, { pageSize: 1 }),
    ])
      .then(([metalsRes, ordersRes]) => {
        const list = metalsRes.data ?? metalsRes ?? [];
        setMetals(list);
        if (list.length > 0) setSelectedMetalId(String(list[0].metal.id));

        const recentOrders = ordersRes.data ?? [];
        const lastOrder    = recentOrders[0] ?? null;
        if (lastOrder) {
          const collections = lastOrder.collections ?? [];
          const lastColl    = collections[collections.length - 1];
          setLastPayment({
            date:       lastColl?.collectionDate ?? lastOrder.entryDate,
            fineCredit: lastColl?.fineCredit ?? null,
            metalName:  lastOrder.metal?.name ?? null,
          });
        } else {
          setLastPayment(null);
        }
      })
      .catch(() => { setMetals([]); setLastPayment(null); })
      .finally(() => setMetalsLoading(false));
  }, [selectedShop]);

  const updateGram = useCallback((key, val) => {
    setGramForm((f) => ({ ...f, [key]: val }));
    setError("");
  }, []);

  const updateCash = useCallback((key, val) => {
    setCashForm((f) => ({ ...f, [key]: val }));
    setError("");
  }, []);

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    setError("");
  };

  // ── derived values ───────────────────────────────────────────────────────────
  const selectedMetal = useMemo(
    () => metals.find((r) => String(r.metal.id) === String(selectedMetalId)),
    [metals, selectedMetalId],
  );
  const currentRate     = selectedMetal?.currentRate ?? selectedMetal?.metal?.currentRate ?? null;
  const metalTunch      = selectedMetal?.metal?.tunch ?? 100;
  const metalName       = selectedMetal?.metal?.name ?? "Metal";
  const currentDue      = selectedMetal?.outstandingDue ?? selectedMetal?.ledgerBalance ?? 0;
  const advanceBalance  = selectedMetal?.advanceBalance ?? 0;

  const fine      = calcFine(gramForm.weight, metalTunch);
  const cashRate  = toNumber(cashForm.metalRate) || toNumber(currentRate);
  const cashFine  = calcConverted(cashForm.cashAmount, cashRate);

  // ── validate: at least one collection entry ──────────────────────────────────
  const isValid = useMemo(() => {
    if (!selectedShop || !selectedMetalId) return false;
    return fine > 0 || cashFine > 0;
  }, [selectedShop, selectedMetalId, fine, cashFine]);

  // ── submit: call whichever APIs have values ──────────────────────────────────
  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const calls = [];

      if (fine > 0) {
        calls.push(
          khatabookService.createGoldCollection({
            shopkeeperId:     Number(selectedShop.id),
            metalId:          Number(selectedMetalId),
            receivedQuantity: fine,
            notes:            notes.trim() || undefined,
          }),
        );
      }

      if (cashFine > 0) {
        calls.push(
          khatabookService.createCashCollection({
            shopkeeperId: Number(selectedShop.id),
            metalId:      Number(selectedMetalId),
            cashAmount:   toNumber(cashForm.cashAmount),
            metalRate:    cashRate,
            notes:        notes.trim() || undefined,
          }),
        );
      }

      await Promise.all(calls);
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

        <CollectionHeader onClose={onClose} />

        {/* ── Shop selector ─────────────────────────────────────────── */}
        <div className="collection-modal__section-label">
          Select Shop <span>*</span>
        </div>
        <ShopSearchDropdown
          query={shopQuery}
          results={shopResults}
          loading={shopLoading}
          selectedShop={selectedShop}
          onQueryChange={setShopQuery}
          onSelectShop={handleSelectShop}
          metals={metals}
          lastPayment={lastPayment}
          currentRate={currentRate}
          rateUpdatedAt={currentRate ? "Today, live rate" : null}
        />

        {/* ── Collection details ─────────────────────────────────────── */}
        {selectedShop && (
          <div className="collection-modal__details">
            <div className="collection-modal__details-title">Collection Details</div>

            <MetalSelector
              metals={metals}
              selectedMetalId={selectedMetalId}
              onSelect={setSelectedMetalId}
              currentRate={currentRate}
            />

            {selectedMetalId && (
              <>
                {/* Two-column form: gram left, cash right */}
                <div className="collection-modal__dual-form">

                  {/* Gram section */}
                  <div className="collection-modal__form-section">
                    <div className="collection-modal__form-section-label">Metal (Gram)</div>
                    <div className="collection-modal__form collection-modal__form--inner">
                      <GramCollectionForm
                        form={gramForm}
                        onChange={updateGram}
                        metalTunch={metalTunch}
                      />
                    </div>
                  </div>

                  <div className="collection-modal__form-divider" />

                  {/* Cash section */}
                  <div className="collection-modal__form-section">
                    <div className="collection-modal__form-section-label">Cash</div>
                    <div className="collection-modal__form collection-modal__form--inner">
                      <CashCollectionForm
                        form={cashForm}
                        onChange={updateCash}
                        currentRate={currentRate}
                      />
                    </div>
                  </div>

                </div>

                {/* Combined calculation */}
                <div className="collection-modal__field collection-modal__calc-field">
                  <label className="collection-modal__label">Final Calculation</label>
                  <CombinedCalc
                    currentDue={currentDue}
                    advanceBalance={advanceBalance}
                    fine={fine}
                    cashAmount={cashForm.cashAmount}
                    cashRate={cashRate}
                  />
                </div>

                {/* Shared notes */}
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
                  Collection will be added in {metalName} account of the selected shop.
                </div>
              </>
            )}
          </div>
        )}

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
