import { ChartNoAxesCombined } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "../../../../components/skeleton/Skeleton.jsx";
import { khatabookService } from "../../../../services/resourceServices.js";

const fmt = (v) => `${Number(v ?? 0).toFixed(3)} g`;

function Stat({ label, value, className = "" }) {
  return (
    <div className="metal-analytics__stat">
      <span>{label}</span>
      <strong className={className}>{value}</strong>
    </div>
  );
}

function MetalSection({ data }) {
  const hasDue     = Number(data.outstandingDue ?? 0) > 0;
  const hasCredit  = Number(data.availableCredit ?? 0) > 0;
  const hasAdvance = Number(data.advanceBalance ?? 0) > 0;
  const metalName  = data.metal?.name ?? "Metal";

  return (
    <div className={`metal-analytics__metal-card${hasDue ? " has-due" : ""}`}>
      <div className="metal-analytics__metal-head">
        <div className="metal-analytics__metal-title">
          <span className="metal-analytics__metal-icon">
            <ChartNoAxesCombined size={18} />
          </span>
          <strong>{metalName}</strong>
        </div>
        <span className={`metal-analytics__due-badge${hasDue ? " is-due" : " is-clear"}`}>
          {fmt(data.outstandingDue)} due
        </span>
      </div>

      <div className="metal-analytics__stat-grid metal-analytics__stat-grid--top">
        <Stat
          label="Outstanding Due"
          value={fmt(data.outstandingDue)}
          className={hasDue ? "is-due" : ""}
        />
        <Stat label="Delivered" value={fmt(data.deliveredQuantity)} />
        <Stat label="Received" value={fmt(data.receivedQuantity)} />
      </div>

      <div className="metal-analytics__divider" />

      <div className="metal-analytics__stat-grid">
        <Stat label="Credit Limit" value={fmt(data.creditLimit)} />
        <Stat
          label="Available Credit"
          value={fmt(data.availableCredit)}
          className={hasCredit ? "is-credit" : ""}
        />
        {hasAdvance && (
          <Stat
            label="Advance Balance"
            value={fmt(data.advanceBalance)}
            className="is-advance"
          />
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 13 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Skeleton w="42%" h={13} />
          <Skeleton w="22%" h={13} />
        </div>
      ))}
    </div>
  );
}

export function GoldAnalyticsCard({ shopkeeperId }) {
  const [metals, setMetals]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopkeeperId) return;
    khatabookService
      .metals(shopkeeperId)
      .then((res) => setMetals(res.data ?? []))
      .catch(() => setMetals([]))
      .finally(() => setLoading(false));
  }, [shopkeeperId]);

  return (
    <div className="sd-info-card metal-analytics">
      <div className="sd-info-card__header">
        <h2 className="sd-info-card__title">Metal Analytics</h2>
        {!loading && metals.length > 0 && (
          <span className="metal-analytics__count">{metals.length} metal{metals.length > 1 ? "s" : ""}</span>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : metals.length === 0 ? (
        <div className="shopkeeper-details__state shopkeeper-details__state--compact">
          No metal data found.
        </div>
      ) : (
        <div className="metal-analytics__grid">
          {metals.map((metalData, idx) => (
            <MetalSection
              key={metalData.metal?.id ?? idx}
              data={metalData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
