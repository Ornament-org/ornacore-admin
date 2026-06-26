import { CreditLimitsCard } from "../shopkeeper-details/CreditLimitsCard.jsx";
import { GoldAnalyticsCard } from "../shopkeeper-details/GoldAnalyticsCard.jsx";
import { GoldSummaryCards } from "../shopkeeper-details/GoldSummaryCards.jsx";
import { LedgerSummaryCard } from "../shopkeeper-details/LedgerSummaryCard.jsx";
import { OrderStatsCard } from "../shopkeeper-details/OrderStatsCard.jsx";
import { RecentActivityCard } from "../shopkeeper-details/RecentActivityCard.jsx";
import { ShopInfoCard } from "./ShopInfoCard.jsx";
import "./ShopOverview.scss";

export function ShopOverview({ shopkeeperId, details, analytics, ordersSummary, ledgerSummary, recentActivity }) {
  const summary = {
    totalGoldDue:       details?.gold?.totalGoldDue,
    totalGoldDelivered: details?.gold?.totalGoldDelivered,
    totalGoldReceived:  details?.gold?.totalGoldReceived,
    availableCredit:    analytics?.gold?.creditRemaining,
  };

  return (
    <div className="shop-overview">

      {/* ── 4 KPI cards ─────────────────────────���───────────── */}
      <GoldSummaryCards summary={summary} />

      {/* ── Unified shop + owner + address + map ────────────── */}
      <ShopInfoCard
        shop={details?.shop}
        owner={details?.owner}
        address={details?.address}
      />

      {/* ── Gold analytics + Order stats ────────────────────── */}
      <div className="shop-overview__grid-2">
        <GoldAnalyticsCard shopkeeperId={shopkeeperId} />
        <OrderStatsCard    orders={ordersSummary} />
      </div>

      {/* ── Ledger summary + Credit limits ──────────────────── */}
      <div className="shop-overview__grid-2">
        <LedgerSummaryCard ledger={ledgerSummary} />
        <CreditLimitsCard  limits={details?.creditLimits ?? []} />
      </div>

      {/* ── Recent activity (full width) ────────────────────── */}
      <RecentActivityCard activities={recentActivity ?? []} />

    </div>
  );
}
