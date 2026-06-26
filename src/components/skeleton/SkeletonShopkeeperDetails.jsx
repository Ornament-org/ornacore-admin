import { Skeleton } from "./Skeleton.jsx";

/* Mirrors the exact layout of ShopkeeperDetailsPage > Overview */
export function SkeletonShopkeeperDetails() {
  return (
    <div className="sk-page">

      {/* ── Header card ─────────────────────────────────────── */}
      <div className="sk-card" style={{ background: "linear-gradient(135deg,#fff 55%,#fdf6e8 100%)" }}>
        <div className="sk-row" style={{ alignItems: "flex-start" }}>
          {/* Avatar */}
          <Skeleton w={68} h={68} r={18} />
          {/* Info block */}
          <div className="sk-col" style={{ gap: 10 }}>
            <div className="sk-row" style={{ gap: 10 }}>
              <Skeleton w={200} h={24} r={8} />
              <Skeleton w={64}  h={22} r={20} />
            </div>
            <Skeleton w={300} h={13} r={6} />
            <div className="sk-row" style={{ gap: 8 }}>
              <Skeleton w={100} h={26} r={100} />
              <Skeleton w={130} h={26} r={100} />
              <Skeleton w={90}  h={26} r={100} />
            </div>
          </div>
          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
            <Skeleton w={100} h={36} r={10} />
            <Skeleton w={120} h={36} r={10} />
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="sk-card" style={{ padding: "8px", background: "#f9f6f0", display: "flex", gap: 6 }}>
        <Skeleton w={90}  h={36} r={10} />
        <Skeleton w={160} h={36} r={10} />
        <Skeleton w={80}  h={36} r={10} />
      </div>

      {/* ── 4 KPI cards ─────────────────────────────────────── */}
      <div className="sk-grid-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="sk-card sk-row" style={{ gap: 16 }}>
            <Skeleton w={50} h={50} r={14} />
            <div className="sk-col" style={{ gap: 8 }}>
              <Skeleton w="70%" h={12} />
              <Skeleton w="85%" h={22} r={6} />
              <Skeleton w="50%" h={11} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 1: 3 info cards ─────────────────────────────── */}
      <div className="sk-grid-3">
        {[5, 4, 4].map((rows, ci) => (
          <div key={ci} className="sk-card" style={{ padding: 0 }}>
            <div className="sk-card__header" style={{ padding: "17px 20px 15px" }}>
              <Skeleton w={36} h={36} r={11} />
              <Skeleton w={130} h={14} />
            </div>
            <div className="sk-card__body" style={{ padding: "4px 20px 14px", gap: 0 }}>
              {Array.from({ length: rows }).map((_, ri) => (
                <div key={ri} className="sk-row" style={{ justifyContent: "space-between", padding: "11px 0", borderBottom: ri < rows - 1 ? "1px solid #f5f0e8" : "none" }}>
                  <Skeleton w="35%" h={13} />
                  <Skeleton w="40%" h={13} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Gold analytics + Order stats ─────────────── */}
      <div className="sk-grid-2">
        {[7, 4].map((rows, ci) => (
          <div key={ci} className="sk-card" style={{ padding: 0 }}>
            <div className="sk-card__header" style={{ padding: "17px 20px 15px" }}>
              <Skeleton w={36} h={36} r={11} />
              <Skeleton w={140} h={14} />
            </div>
            <div style={{ padding: "4px 20px 14px" }}>
              {Array.from({ length: rows }).map((_, ri) => (
                <div key={ri} className="sk-row" style={{ justifyContent: "space-between", padding: "11px 0", borderBottom: ri < rows - 1 ? "1px solid #f5f0e8" : "none" }}>
                  <Skeleton w="40%" h={13} />
                  <Skeleton w="25%" h={13} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 3: Ledger + Credit limits ───────────────────── */}
      <div className="sk-grid-2">
        {[5, 3].map((rows, ci) => (
          <div key={ci} className="sk-card" style={{ padding: 0 }}>
            <div className="sk-card__header" style={{ padding: "17px 20px 15px" }}>
              <Skeleton w={36} h={36} r={11} />
              <Skeleton w={150} h={14} />
            </div>
            <div style={{ padding: "4px 20px 14px" }}>
              {Array.from({ length: rows }).map((_, ri) => (
                <div key={ri} className="sk-row" style={{ justifyContent: "space-between", padding: "11px 0", borderBottom: ri < rows - 1 ? "1px solid #f5f0e8" : "none" }}>
                  <Skeleton w="35%" h={13} />
                  <Skeleton w="30%" h={13} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent activity (full width) ────────────────────── */}
      <div className="sk-card" style={{ padding: 0 }}>
        <div className="sk-card__header" style={{ padding: "17px 20px 15px" }}>
          <Skeleton w={36} h={36} r={11} />
          <Skeleton w={140} h={14} />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="sk-activity-row">
            <Skeleton w={36} h={36} r={11} />
            <div className="sk-col" style={{ gap: 6 }}>
              <Skeleton w="30%" h={13} />
              <Skeleton w="55%" h={11} />
            </div>
            <Skeleton w={90} h={11} r={6} style={{ flexShrink: 0 }} />
          </div>
        ))}
      </div>

    </div>
  );
}
