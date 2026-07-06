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

export function MetalRatesPage() {
  const [rates, setRates] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
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
                basePricePerGram: row.basePricePerGram ?? "",
                extraPerGram: row.extraPerGram ?? "",
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
      const response = await metalRateService.upsert(metalId, {
        basePricePerGram: Number(draft.basePricePerGram || 0),
        extraPerGram: Number(draft.extraPerGram || 0),
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

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Catalog"
        title="Metal Rates"
        description="Set today's base price and markup per metal. Shopkeepers and the mobile app see the sum as the current rate."
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={load}>
            Refresh
          </Button>
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
              const draft = drafts[rate.metalId] ?? { basePricePerGram: "", extraPerGram: "" };
              const computedTotal =
                Number(draft.basePricePerGram || 0) + Number(draft.extraPerGram || 0);
              const isUp = (rate.change ?? 0) >= 0;

              return (
                <div className="metal-rate-row" key={rate.metalId}>
                  <div className="metal-rate-row__identity">
                    <strong>{rate.name}</strong>
                    <span>{rate.rateUnit?.replaceAll("_", " ")}</span>
                  </div>

                  <label className="metal-rate-row__field">
                    <span>Base price (₹/gm)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.basePricePerGram}
                      onChange={setDraftField(rate.metalId, "basePricePerGram")}
                    />
                  </label>

                  <label className="metal-rate-row__field">
                    <span>Extra (₹/gm)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.extraPerGram}
                      onChange={setDraftField(rate.metalId, "extraPerGram")}
                    />
                  </label>

                  <div className="metal-rate-row__total">
                    <span>Current total</span>
                    <strong>{formatMoney(computedTotal)}</strong>
                    {rate.change !== null && (
                      <em className={isUp ? "is-up" : "is-down"}>
                        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {formatMoney(Math.abs(rate.change))} ({Math.abs(rate.changePercent ?? 0)}%)
                      </em>
                    )}
                  </div>

                  <div className="metal-rate-row__meta">
                    <span>Last updated</span>
                    <strong>{formatDate(rate.asOfDate)}</strong>
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
