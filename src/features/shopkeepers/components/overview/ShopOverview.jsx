import { OverviewAnalyticsCard } from "../shopkeeper-details/OverviewAnalyticsCard.jsx";
import { LedgerSummaryCard } from "../shopkeeper-details/LedgerSummaryCard.jsx";
import { OrderStatsCard } from "../shopkeeper-details/OrderStatsCard.jsx";
import { RecentActivityCard } from "../shopkeeper-details/RecentActivityCard.jsx";
import "./ShopOverview.scss";

export function ShopOverview({ shopkeeperId, ordersSummary, ledgerSummary, recentActivity, metalName }) {
  return (
    <div className="shop-overview">

      <OverviewAnalyticsCard shopkeeperId={shopkeeperId} />

      <div className="shop-overview__analytics-grid">
        <OrderStatsCard orders={ordersSummary} />
        <LedgerSummaryCard ledger={ledgerSummary} metalName={metalName} />
      </div>

      {/* ── Recent activity (full width) ────────────────────── */}
      <RecentActivityCard activities={recentActivity ?? []} />

    </div>
  );
}
