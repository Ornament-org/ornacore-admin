import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  Coins,
  Cuboid,
  Download,
  Gem,
  IndianRupee,
  Plus,
  Save,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePermissions } from "../../auth/permissions.js";
import { khatabookService, orderService } from "../../../services/resourceServices.js";
import { formatMoney, formatQuantity } from "./khatabookFormatters.js";
// ── helpers ──────────────────────────────────────────────────────────────────

const emptyItem = (tunch = "") => ({ itemName: "", grossWeight: "", tunch, sourceOrderId: null });

const PENDING_ORDER_STATUSES_EXCLUDED = ["DELIVERED", "CANCELLED"];

const today = () => new Date().toISOString().slice(0, 10);
const toNumber = (v) => (v === "" || v == null ? 0 : Number(v));
const q = (v) => Number(v || 0).toFixed(3);

const fineWeight = (item) => {
  const gw = toNumber(item.grossWeight);
  const t = toNumber(item.tunch);
  return gw && t ? q((gw * t) / 100) : "0.000";
};

const cashToFine = (cash, rate) => {
  const c = toNumber(cash);
  const r = toNumber(rate);
  return c > 0 && r > 0 ? q((c / r) * 10) : "0.000";
};

const errorDetails = (err) => err.response?.data?.error?.details ?? null;

// ── Main component ────────────────────────────────────────────────────────────

export function CreateKhatabookOrder({
  shopkeeperId,
  metals = [],
  defaultMetalId = "",
  onCancel,
  onCreated,
}) {
  const { hasPermission } = usePermissions();
  const canOverride = hasPermission("shopkeeper.credit_limit.update");
  const firstMetalId = defaultMetalId || metals[0]?.metal?.id || "";

  const [form, setForm] = useState({
    metalId: firstMetalId ? String(firstMetalId) : "",
    entryDate: today(),
    defaultTunch: "52",
    notes: "",
    overrideCreditLimit: false,
    collection: {
      metalReceived: "",  // gm fine weight
      cashReceived: "",   // ₹
      metalRate: "",      // ₹ per 10 gm - falls back to current rate
      notes: "",
    },
  });

  const [items, setItems] = useState([emptyItem("52")]);
  const [saving, setSaving] = useState(false);
  const [creditError, setCreditError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);

  useEffect(() => {
    if (!form.metalId && firstMetalId)
      setForm((f) => ({ ...f, metalId: String(firstMetalId) }));
  }, [firstMetalId, form.metalId]);

  // Orders the shopkeeper already placed through the web app, not yet
  // delivered — admin can pull these into this delivery instead of re-typing them.
  useEffect(() => {
    if (!shopkeeperId) return;
    let alive = true;
    setLoadingPending(true);
    orderService
      .list({ shopkeeperId, pageSize: 50, sortBy: "createdAt", sortDirection: "DESC" })
      .then((res) => {
        if (!alive) return;
        const rows = (res.data ?? []).filter(
          (o) => !PENDING_ORDER_STATUSES_EXCLUDED.includes(o.status),
        );
        setPendingOrders(rows);
      })
      .catch(() => { if (alive) setPendingOrders([]); })
      .finally(() => { if (alive) setLoadingPending(false); });
    return () => { alive = false; };
  }, [shopkeeperId]);

  const selectedSummary = useMemo(
    () => metals.find((r) => String(r.metal.id) === String(form.metalId)),
    [form.metalId, metals],
  );

  const metalName = selectedSummary?.metal?.name ?? "Metal";
  const currentRate = selectedSummary?.currentRate ?? selectedSummary?.metal?.currentRate ?? "";
  const collectionRate = toNumber(form.collection.metalRate) || toNumber(currentRate);

  const validItems = useMemo(
    () =>
      items.filter(
        (it) => it.itemName.trim() && toNumber(it.grossWeight) > 0 && toNumber(it.tunch) > 0,
      ),
    [items],
  );

  // An order is "pulled" as soon as any of its items sit in the table, even if
  // the weight still needs filling in — used to grey out the Pull button.
  const pulledOrderIds = useMemo(
    () => new Set(items.map((it) => it.sourceOrderId).filter(Boolean)),
    [items],
  );

  // Only orders whose pulled items are actually complete (and therefore part
  // of `validItems`) get marked DELIVERED on save.
  const submittableSourceOrderIds = useMemo(
    () => [...new Set(validItems.map((it) => it.sourceOrderId).filter(Boolean))],
    [validItems],
  );

  const pullOrder = (webOrder) => {
    const pulledItems = (webOrder.items ?? []).map((item) => {
      const variant = item.variant;
      const weightEach = toNumber(variant?.weightGrams);
      const grossWeight = weightEach ? q(weightEach * toNumber(item.quantity)) : "";
      const tunch =
        variant?.tunch != null && variant.tunch !== "" ? String(variant.tunch) : form.defaultTunch;
      return {
        itemName: `${item.productNameSnapshot ?? "Item"} (${item.skuSnapshot ?? "-"})`,
        grossWeight,
        tunch,
        sourceOrderId: webOrder.id,
      };
    });
    if (!pulledItems.length) return;
    setItems((its) => {
      const withoutBlankRow = its.filter(
        (it) => it.itemName.trim() || toNumber(it.grossWeight) > 0 || it.sourceOrderId,
      );
      return [...withoutBlankRow, ...pulledItems];
    });
  };

  const localFineDelivered = useMemo(
    () => q(validItems.reduce((s, it) => s + Number(fineWeight(it)), 0)),
    [validItems],
  );

  // derived fine credit shown in the collection panel
  const localCashFine = useMemo(
    () => cashToFine(form.collection.cashReceived, collectionRate),
    [form.collection.cashReceived, collectionRate],
  );

  const payload = useMemo(() => {
    const { metalReceived, cashReceived, notes } = form.collection;
    const cashAmount = toNumber(cashReceived);
    return {
      shopkeeperId: Number(shopkeeperId),
      metalId: Number(form.metalId),
      entryDate: form.entryDate,
      notes: form.notes,
      overrideCreditLimit: form.overrideCreditLimit,
      items: validItems.map((it) => ({
        itemName: it.itemName.trim(),
        grossWeight: Number(it.grossWeight),
        tunch: Number(it.tunch),
      })),
      sourceOrderIds: submittableSourceOrderIds,
      collection: {
        metalReceived: toNumber(metalReceived),
        cashReceived: cashAmount,
        metalRate:
          cashAmount > 0 && collectionRate > 0 ? collectionRate : undefined,
        notes: notes.trim() || undefined,
      },
    };
  }, [collectionRate, form, shopkeeperId, submittableSourceOrderIds, validItems]);

  // live preview (debounced 250 ms)
  useEffect(() => {
    if (!form.metalId || validItems.length === 0) {
      setPreview(null);
      setCreditError(null);
      return;
    }
    let alive = true;
    const timer = setTimeout(() => {
      khatabookService
        .previewOrder(payload)
        .then((res) => {
          if (!alive) return;
          setPreview(res);
          setCreditError(res?.creditLimitExceeded ? res : null);
        })
        .catch(() => { if (alive) setPreview(null); });
    }, 250);
    return () => { alive = false; clearTimeout(timer); };
  }, [form.metalId, payload, validItems.length]);

  // ── updaters ────────────────────────────────────────────────────────────────

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setCreditError(null);
    setError("");
  };

  const setCollField = (key, val) => {
    setForm((f) => ({ ...f, collection: { ...f.collection, [key]: val } }));
    setCreditError(null);
    setError("");
  };

  const setDefaultTunch = (val) => {
    // BUG-11 fix: capture the current default before updating so we can detect
    // items that were still at the old default (not manually overridden by the user).
    // Previously `it.tunch || val` short-circuited on any truthy tunch value, so
    // changing the default never propagated to items already showing "52" (or any
    // other truthy string).
    const oldDefault = form.defaultTunch;
    setForm((f) => ({ ...f, defaultTunch: val }));
    setItems((its) =>
      its.map((it) => ({
        ...it,
        tunch: it.tunch === oldDefault || !it.tunch ? val : it.tunch,
      })),
    );
  };

  const updateItem = (idx, key, val) => {
    setItems((its) => its.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));
    setCreditError(null);
    setError("");
  };

  const addItem    = () => setItems((its) => [...its, emptyItem(form.defaultTunch)]);
  const removeItem = (idx) =>
    setItems((its) => (its.length === 1 ? [emptyItem(form.defaultTunch)] : its.filter((_, i) => i !== idx)));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await khatabookService.createOrder(payload);
      onCreated();
    } catch (err) {
      const details = errorDetails(err);
      if (err.response?.data?.error?.code === "CREDIT_LIMIT_EXCEEDED")
        setCreditError(details);
      setError(
        err.response?.data?.error?.message ||
        err.userMessage ||
        err.message ||
        "Unable to create order.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ── derived preview / display values ────────────────────────────────────────

  const currentDue           = preview?.currentDue           ?? selectedSummary?.currentRunningDue ?? "0.000";
  const creditLimit          = preview?.creditLimit           ?? selectedSummary?.creditLimit       ?? "0.000";
  const availableCredit      = preview?.availableCredit       ?? selectedSummary?.availableCredit   ?? "0.000";
  const fineDelivered        = preview?.fineDelivered         ?? localFineDelivered;
  const totalBeforeColl      = preview?.totalBeforeCollection ?? q(Number(currentDue) + Number(fineDelivered));
  const collectionCredit     = preview?.collectionCredit      ?? "0.000";
  const attemptedDue         = preview?.attemptedDue          ?? q(Math.max(0, Number(totalBeforeColl) - Number(collectionCredit)));
  const exceededBy           = preview?.exceededBy            ?? q(Math.max(0, Number(attemptedDue) - Number(creditLimit)));
  const limitCrossed         = Number(exceededBy) > 0;
  const metalCreditLocal     = q(form.collection.metalReceived);
  const hasMetalCollection   = toNumber(form.collection.metalReceived) > 0;
  const hasCashCollection    = toNumber(form.collection.cashReceived) > 0;
  const collectionRateMissing = hasCashCollection && collectionRate <= 0;
  const saveDisabled         =
    saving ||
    !form.metalId ||
    validItems.length === 0 ||
    collectionRateMissing ||
    (limitCrossed && !form.overrideCreditLimit);
  const collectionStatusText = hasMetalCollection || hasCashCollection
    ? "Collection will be settled FIFO against outstanding dues."
    : "Leave both fields empty when nothing is collected at delivery.";

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <section className="khatabook-create">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="khatabook-create__headline">
        <div>
          <h2>Create New Order</h2>
          <p>Record delivered jewellery and optional collection at time of delivery.</p>
        </div>
        <div className="khatabook-create__header-actions">
          <button type="button" onClick={onCancel}><X size={16} /> Cancel</button>
          <button disabled={saveDisabled} type="button" onClick={submit}>
            <Save size={16} />
            {saving ? "Saving…" : "Save Order"}
          </button>
        </div>
      </header>

      {/* ── Top fields: date / order id / metal / metrics ──────────────────── */}
      <div className="khatabook-create__topline">
        <label>
          <span>Order Date</span>
          <div className="khatabook-create__input-icon">
            <input
              type="date"
              value={form.entryDate}
              onChange={(e) => setField("entryDate", e.target.value)}
            />
            <CalendarDays size={15} />
          </div>
        </label>
        <label>
          <span>Order ID</span>
          <input disabled value="Auto generated" />
        </label>
        <label>
          <span>Metal</span>
          <div className="khatabook-create__metal-select">
            <b><Cuboid /></b>
            <select
              value={form.metalId}
              onChange={(e) => setField("metalId", e.target.value)}
            >
              <option value="">Select metal</option>
              {metals.map((r) => (
                <option key={r.metal.id} value={r.metal.id}>{r.metal.name}</option>
              ))}
            </select>
            <ChevronDown size={15} />
          </div>
        </label>
        <div className="khatabook-create__metric">
          <span>Running Due</span>
          <strong>{formatQuantity(currentDue)}</strong>
        </div>
        <div className="khatabook-create__metric">
          <span>Credit Limit</span>
          <strong>{formatQuantity(creditLimit)}</strong>
        </div>
        <div className="khatabook-create__metric">
          <span>Available Credit</span>
          <strong className="is-green">{formatQuantity(availableCredit)}</strong>
        </div>
        <div className="khatabook-create__metric">
          <span>Limit Crossed</span>
          <strong className={limitCrossed ? "is-red" : ""}>
            {formatQuantity(exceededBy)}
            {limitCrossed && <AlertTriangle size={15} />}
          </strong>
        </div>
      </div>

      {/* ── Sub fields: tunch / note ────────────────────────────────────────── */}
      <div className="khatabook-create__subline">
        <label>
          <span>Default Tunch / Purity</span>
          <input
            type="number"
            min="0"
            value={form.defaultTunch}
            onChange={(e) => setDefaultTunch(e.target.value)}
          />
        </label>
        <label>
          <span>Note (optional)</span>
          <input
            placeholder="Add note…"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </label>
      </div>

      {/* ── Pending web orders ───────────────────────────────────────────────── */}
      {(loadingPending || pendingOrders.length > 0) && (
        <div className="khatabook-create__pending">
          <div className="khatabook-create__pending-head">
            <h3><ShoppingBag size={14} /> Pending Web Orders</h3>
            <span>Requested by the shopkeeper through the app — pull them into this delivery.</span>
          </div>
          {loadingPending ? (
            <div className="khatabook-create__pending-empty">Loading…</div>
          ) : (
            <div className="khatabook-create__pending-list">
              {pendingOrders.map((webOrder) => {
                const pulled = pulledOrderIds.has(webOrder.id);
                const itemCount = webOrder.items?.length ?? 0;
                return (
                  <div className="khatabook-create__pending-row" key={webOrder.id}>
                    <div className="khatabook-create__pending-info">
                      <strong>{webOrder.orderNumber}</strong>
                      <span>{itemCount} item{itemCount === 1 ? "" : "s"} · {webOrder.status}</span>
                    </div>
                    <button
                      type="button"
                      disabled={pulled}
                      onClick={() => pullOrder(webOrder)}
                    >
                      <Download size={14} />
                      {pulled ? "Pulled" : "Pull into this order"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Items table ────────────────────────────────────────────────────── */}
      <div className="khatabook-create__items-head">
        <h3>Items Delivered</h3>
        <button type="button" onClick={addItem}><Plus size={15} /> Add Item</button>
      </div>

      <div className="khatabook-create__table">
        <div className="khatabook-create__row khatabook-create__row--head">
          <span>#</span>
          <span>Item Name</span>
          <span>Gross Weight (gm)</span>
          <span>Tunch (%)</span>
          <span>Fine Weight (gm)</span>
          <span></span>
        </div>
        {items.map((item, idx) => {
          const pi = preview?.items?.[idx];
          return (
            <div className={`khatabook-create__row${item.sourceOrderId ? " is-pulled" : ""}`} key={idx}>
              <span>{idx + 1}</span>
              <div className="khatabook-create__item-name">
                <input
                  placeholder="Item name"
                  value={item.itemName}
                  onChange={(e) => updateItem(idx, "itemName", e.target.value)}
                />
                {item.sourceOrderId && <small>from web order</small>}
              </div>
              <input
                type="number" min="0" step="0.001"
                value={item.grossWeight}
                onChange={(e) => updateItem(idx, "grossWeight", e.target.value)}
              />
              <input
                type="number" min="0" step="0.001"
                value={item.tunch}
                onChange={(e) => updateItem(idx, "tunch", e.target.value)}
              />
              <strong>{formatQuantity(pi?.fineWeight ?? fineWeight(item))}</strong>
              <button aria-label="Remove item" type="button" onClick={() => removeItem(idx)}>
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
        <div className="khatabook-create__total">
          <span>
            <strong>Total Fine Weight</strong>
            <small>Calculated from weight × tunch</small>
          </span>
          <strong>{formatQuantity(fineDelivered)}</strong>
        </div>

        {/* Credit limit exceeded banner */}
        {limitCrossed && (
          <div className="khatabook-create__limitbar">
            <div className="khatabook-create__limitbar-content">
              <div className="khatabook-create__limitbar-icon">
                <AlertTriangle size={18} />
              </div>
              <div className="khatabook-create__limitbar-text">
                <div className="khatabook-create__limitbar-title">Credit Limit Exceeded</div>
                <div className="khatabook-create__limitbar-description">
                  This order exceeds the credit limit by{" "}
                  <strong>{formatQuantity(exceededBy)}</strong>.
                </div>
              </div>
            </div>
            {canOverride ? (
              <div className="khatabook-create__override">
                <div className="khatabook-create__override-content">
                  <span className="khatabook-create__override-title">Override Credit Limit</span>
                  <span className="khatabook-create__override-description">
                    Allow this order beyond the approved credit limit.
                  </span>
                </div>
                <label className="khatabook-create__switch">
                  <input
                    type="checkbox"
                    checked={form.overrideCreditLimit}
                    onChange={(e) => setField("overrideCreditLimit", e.target.checked)}
                  />
                  <span className="khatabook-create__slider" />
                </label>
              </div>
            ) : (
              <div className="khatabook-create__override-required">
                You do not have permission to override credit limits
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom panels: Collection + Due Summary ─────────────────────────── */}
      <div className="khatabook-create__panels">

        {/* Collection panel */}
        <section className="khatabook-create__panel">
          <div className="khatabook-create__panel-head">
            <h3>Collection at Delivery <small>(Optional)</small></h3>
            <span>{metalName}</span>
          </div>

          <div className="khatabook-coll-combined">
            <div className="khatabook-coll-card">
              <div className="khatabook-coll-card__title">
                <Gem size={14} />
                <span>Metal</span>
              </div>
              <label>
                <span>{metalName} Fine Weight Received (gm)</span>
                <input
                  type="number" min="0" step="0.001"
                  placeholder="0.000"
                  value={form.collection.metalReceived}
                  onChange={(e) => setCollField("metalReceived", e.target.value)}
                />
              </label>
              <div className="khatabook-coll-result">
                <span>Metal credit</span>
                <strong>{formatQuantity(metalCreditLocal)}</strong>
              </div>
            </div>

            <div className="khatabook-coll-card">
              <div className="khatabook-coll-card__title">
                <IndianRupee size={14} />
                <span>Cash</span>
              </div>
              <label>
                <span>Cash Received</span>
                <input
                  type="number" min="0"
                  placeholder="0"
                  value={form.collection.cashReceived}
                  onChange={(e) => setCollField("cashReceived", e.target.value)}
                />
              </label>
              <label>
                <span><Coins size={12} /> Rate (₹ per 10 gm)</span>
                <input
                  type="number" min="0"
                  placeholder={currentRate ? String(currentRate) : "Enter rate"}
                  value={form.collection.metalRate}
                  onChange={(e) => setCollField("metalRate", e.target.value)}
                />
              </label>
              <div className="khatabook-coll-result">
                <span>
                  {hasCashCollection
                    ? `${formatMoney(toNumber(form.collection.cashReceived))} converts to`
                    : "Cash credit"}
                </span>
                <strong>
                  {hasCashCollection && !collectionRate
                    ? "Rate needed"
                    : formatQuantity(localCashFine)}
                </strong>
              </div>
            </div>
          </div>

          <label className="khatabook-coll-note">
            <span>Collection Note (optional)</span>
            <textarea
              placeholder="Add a note for this collection..."
              value={form.collection.notes}
              onChange={(e) => setCollField("notes", e.target.value)}
            />
          </label>

          <div className="khatabook-coll-hint">
            {collectionStatusText}
          </div>

          <div className="khatabook-create__credit-total">
            <span>Total Credit (in fine gm)</span>
            <strong>{formatQuantity(collectionCredit)}</strong>
          </div>
        </section>

        {/* Due Summary panel */}
        <section className="khatabook-create__panel khatabook-create__panel--summary">
          <h3>Due Summary <small>(Auto Calculated)</small></h3>
          <dl>
            <dt>Previous Running Due</dt>
            <dd>{formatQuantity(currentDue)}</dd>
            <dt>Fine Delivered (this order)</dt>
            <dd>{formatQuantity(fineDelivered)}</dd>
            <dt>Total Before Collection</dt>
            <dd>{formatQuantity(totalBeforeColl)}</dd>
            <dt>Collection Credit Applied</dt>
            <dd>{formatQuantity(collectionCredit)}</dd>
          </dl>
          <div className="khatabook-create__running-due">
            <span>New Running Due</span>
            <strong>{formatQuantity(attemptedDue)}</strong>
          </div>
        </section>

      </div>

      {/* ── Footer actions ─────────────────────────────────────────────────── */}
      <div className="khatabook-create__header-actions">
        <button type="button" onClick={onCancel}><X size={16} /> Cancel</button>
        <button disabled={saveDisabled} type="button" onClick={submit}>
          <Save size={16} />
          {saving ? "Saving…" : "Save Order"}
        </button>
      </div>

      {/* ── Errors ─────────────────────────────────────────────────────────── */}
      {error && <div className="khatabook-create__error">{error}</div>}
      {creditError && !canOverride && (
        <div className="khatabook-create__error">
          You do not have permission to override the credit limit.
        </div>
      )}

    </section>
  );
}
