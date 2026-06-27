import { ChartNoAxesCombined } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "../../../../components/skeleton/Skeleton.jsx";
import { khatabookService } from "../../../../services/resourceServices.js";

const fmt = (v) => `${Number(v ?? 0).toFixed(3)} g`;

function Stat({ label, value, sub, className = "" }) {
  return (
    <div className="metal-analytics__stat">
      <span>{label}</span>
      <div>
        <strong className={className}>{value}</strong>
        {sub && <em className="metal-analytics__stat-sub">{sub}</em>}
      </div>
    </div>
  );
}

function MetalSection({ data }) {
  const hasDue     = Number(data.outstandingDue ?? 0) > 0;
  const hasCredit  = Number(data.availableCredit ?? 0) > 0;
  const hasAdvance = Number(data.advanceBalance ?? 0) > 0;
  const metalName  = data.metal?.name ?? "Metal";
  const monthly    = data.monthly ?? { delivered: "0.000", received: "0.000" };

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

      {/* Monthly overview */}
      <div className="metal-analytics__section-label">This Month</div>
      <div className="metal-analytics__stat-grid">
        <Stat label="Delivered" value={fmt(monthly.delivered)} />
        <Stat label="Received"  value={fmt(monthly.received)}  />
      </div>

      <div className="metal-analytics__divider" />

      {/* Overall / credit */}
      <div className="metal-analytics__section-label">Overall</div>
      <div className="metal-analytics__stat-grid">
        <Stat
          label="Available Credit"
          value={fmt(data.availableCredit)}
          sub={`Limit ${fmt(data.creditLimit)}`}
          className={hasCredit ? "is-credit" : ""}
        />
        <Stat
          label="Outstanding Due"
          value={fmt(data.outstandingDue)}
          className={hasDue ? "is-due" : ""}
        />
        {hasAdvance && (
          <Stat
            label="Advance Balance"
            value={fmt(data.advanceBalance)}
            className="is-advance"
          />
        )}
      </div>

      {/* All-time totals */}
      <div className="metal-analytics__divider" />
      <div className="metal-analytics__section-label">All Time</div>
      <div className="metal-analytics__stat-grid">
        <Stat label="Total Delivered" value={fmt(data.deliveredQuantity)} />
        <Stat label="Total Received"  value={fmt(data.receivedQuantity)}  />
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

export function OverviewAnalyticsCard({ shopkeeperId }) {
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

  const monthLabel = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="sd-info-card metal-analytics">
      <div className="sd-info-card__header">
        <h2 className="sd-info-card__title">Metal Overview</h2>
        {!loading && metals.length > 0 && (
          <span className="metal-analytics__count">{monthLabel}</span>
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
            <MetalSection key={metalData.metal?.id ?? idx} data={metalData} />
          ))}
        </div>
      )}
    </div>
  );
}
