import { RefreshCw, Save, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../../components/common/Button.jsx";
import { Card } from "../../../components/common/Card.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { metalRateService } from "../../../services/resourceServices.js";
import "./MetalRatesPage.scss";

function formatMoney(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value) {
  if (!value) return "Not set yet";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

function displayUnit(rate) {
  return rate.displayUnit ?? (rate.rateUnit === "PER_KG" ? "kg" : rate.rateUnit === "PER_10G" ? "10gm" : "gm");
}

function unitMultiplier(rate) {
  return Number(rate.unitMultiplier ?? (rate.rateUnit === "PER_KG" ? 1000 : rate.rateUnit === "PER_10G" ? 10 : 1));
}

export function MetalRatesPage() {
  const [rates, setRates] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    metalRateService
      .list()
      .then((response) => {
        const rows = response.data ?? [];
        setRates(rows);
        setDrafts(
          Object.fromEntries(
            rows.map((row) => [
              row.metalId,
              {
                displayBasePrice: row.displayBasePrice ?? "",
                displayExtra: row.displayExtra ?? "",
              },
            ]),
          ),
        );
      })
      .catch((requestError) => setError(apiErrorMessage(requestError)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setDraftField = (metalId, field) => (event) => {
    const value = event.target.value;
    setDrafts((current) => ({
      ...current,
      [metalId]: { ...current[metalId], [field]: value },
    }));
  };

  const save = async (metalId) => {
    setSavingId(metalId);
    setError(null);
    try {
      const draft = drafts[metalId];
      const rate = rates.find((row) => row.metalId === metalId);
      const multiplier = unitMultiplier(rate ?? {});
      const response = await metalRateService.upsert(metalId, {
        basePricePerGram: Number((Number(draft.displayBasePrice || 0) / multiplier).toFixed(2)),
        extraPerGram: Number((Number(draft.displayExtra || 0) / multiplier).toFixed(2)),
      });
      setRates((current) =>
        current.map((row) => (row.metalId === metalId ? response.data : row)),
      );
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSavingId(null);
    }
  };

  const syncBullions = async () => {
    setSyncing(true);
    setError(null);
    try {
      await metalRateService.syncBullions();
      load();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Metals"
        title="Metal Rates"
        description="Set today's base price and markup per metal. Shopkeepers and the mobile app see the sum as the current rate."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RefreshCw} loading={syncing} onClick={syncBullions}>
              Sync Bullions
            </Button>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={load}>
              Refresh
            </Button>
          </>
        }
      />

      {error && <FormAlert>{error}</FormAlert>}

      <Card className="metal-rates-card" padded={false}>
        {loading ? (
          <div className="metal-rates-empty">Loading rates…</div>
        ) : rates.length === 0 ? (
          <div className="metal-rates-empty">No active metals found.</div>
        ) : (
          <div className="metal-rates-list">
            {rates.map((rate) => {
              const draft = drafts[rate.metalId] ?? { displayBasePrice: "", displayExtra: "" };
              const unit = displayUnit(rate);
              const computedTotal =
                Number(draft.displayBasePrice || 0) + Number(draft.displayExtra || 0);
              const isUp = (rate.change ?? 0) >= 0;

              return (
                <div className="metal-rate-row" key={rate.metalId}>
                  <div className="metal-rate-row__identity">
                    <strong>{rate.name}</strong>
                    <span>{rate.rateUnit?.replaceAll("_", " ")}</span>
                  </div>

                  <label className="metal-rate-row__field">
                    <span>Base price (₹/{unit})</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.displayBasePrice}
                      onChange={setDraftField(rate.metalId, "displayBasePrice")}
                    />
                  </label>

                  <label className="metal-rate-row__field">
                    <span>Extra (₹/{unit})</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.displayExtra}
                      onChange={setDraftField(rate.metalId, "displayExtra")}
                    />
                  </label>

                  <div className="metal-rate-row__total">
                    <span>Current total (₹/{unit})</span>
                    <strong>{formatMoney(computedTotal)}</strong>
                    {rate.change !== null && (
                      <em className={isUp ? "is-up" : "is-down"}>
                        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {formatMoney(Math.abs(rate.displayChange ?? rate.change))} ({Math.abs(rate.changePercent ?? 0)}%)
                      </em>
                    )}
                  </div>

                  <div className="metal-rate-row__meta">
                    <span>Last updated</span>
                    <strong>{formatDate(rate.asOfDate)}</strong>
                    {rate.sourceName && (
                      <em>
                        {rate.sourceName}
                        {rate.sourceLocation ? ` · ${rate.sourceLocation}` : ""}
                      </em>
                    )}
                  </div>

                  <Button
                    size="sm"
                    icon={Save}
                    loading={savingId === rate.metalId}
                    onClick={() => save(rate.metalId)}
                  >
                    Save
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
