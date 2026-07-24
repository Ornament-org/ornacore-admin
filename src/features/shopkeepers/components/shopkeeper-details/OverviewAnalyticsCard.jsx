import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "../../../../components/skeleton/Skeleton.jsx";
import { analyticsService } from "../../../../services/resourceServices.js";
import { AnalyticsCard } from "./AnalyticsCard.jsx";
import "../overview/ShopOverview.scss";

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const defaultStart = () => {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
};

const defaultEnd = () => toIsoDate(new Date());

function LoadingGrid() {
  return (
    <div className="overview-analytics__grid">
      {[0, 1].map((i) => (
        <div key={i} className="overview-analytics__skeleton-card">
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Skeleton w={46} h={46} r={13} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <Skeleton w="55%" h={11} r={5} />
              <Skeleton w="70%" h={20} r={6} />
            </div>
          </div>
          <Skeleton w="100%" h={1} r={0} style={{ margin: "4px 0" }} />
          {[0, 1].map((j) => (
            <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Skeleton w={13} h={13} r={3} />
              <Skeleton w="50%" h={11} r={5} />
              <Skeleton w="28%" h={11} r={5} style={{ marginLeft: "auto" }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function OverviewAnalyticsCard({ shopkeeperId, refreshKey = 0 }) {
  const today = toIsoDate(new Date());

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate,   setEndDate]   = useState(defaultEnd);
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(false);

  useEffect(() => {
    if (!shopkeeperId) return;
    let alive = true;

    Promise.resolve()
      .then(() => {
        if (!alive) return null;
        setLoading(true);
        setError(false);
        return analyticsService.shopkeeperOverview(shopkeeperId, startDate, endDate);
      })
      .then((res) => { if (alive) setData(res.data ?? null); })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [shopkeeperId, startDate, endDate, refreshKey]);

  const handleStartChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    if (val > endDate) setEndDate(val);
  };

  const handleEndChange = (e) => {
    const val = e.target.value;
    setEndDate(val);
    if (val < startDate) setStartDate(val);
  };

  const visibleCards = (data?.cards ?? []).filter((card) => ["due", "credit"].includes(card.type));

  return (
    <div className="sd-info-card overview-analytics">
      <div className="sd-info-card__header overview-analytics__header">
        <h2 className="sd-info-card__title">Account Position</h2>

        <div className="overview-analytics__date-range">
          <CalendarDays size={14} className="overview-analytics__date-range-icon" />
          <input
            type="date"
            className="overview-analytics__date-input"
            value={startDate}
            max={endDate}
            onChange={handleStartChange}
          />
          <span className="overview-analytics__date-range-sep">—</span>
          <input
            type="date"
            className="overview-analytics__date-input"
            value={endDate}
            min={startDate}
            max={today}
            onChange={handleEndChange}
          />
        </div>
      </div>

      {loading && <LoadingGrid />}

      {!loading && error && (
        <div className="overview-analytics__error">
          Unable to load analytics. Please refresh.
        </div>
      )}

      {!loading && !error && data && (
        <div className="overview-analytics__grid">
          {visibleCards.map((card) => (
            <AnalyticsCard key={card.type} {...card} />
          ))}
        </div>
      )}
    </div>
  );
}
