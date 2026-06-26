import { Skeleton } from "./Skeleton.jsx";

/* Mirrors KhatabookPage: metal due cards + order list */
export function SkeletonKhatabook() {
  return (
    <div className="sk-page">

      {/* ── Metal due cards ─────────────────────────────────── */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="sk-card sk-row" style={{ flex: "1 1 160px", minWidth: 140, gap: 14 }}>
            <Skeleton w={44} h={44} r={14} />
            <div className="sk-col" style={{ gap: 7 }}>
              <Skeleton w="60%" h={12} />
              <Skeleton w="80%" h={20} r={6} />
              <Skeleton w="50%" h={11} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="sk-row" style={{ justifyContent: "space-between" }}>
        <Skeleton w={160} h={36} r={10} />
        <Skeleton w={120} h={36} r={10} />
      </div>

      {/* ── Order list rows ─────────────────────────────────── */}
      <div className="sk-card" style={{ padding: 0 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="sk-table-row">
            <Skeleton w={36}  h={36} r={11} />
            <div className="sk-col" style={{ gap: 6, flex: 2 }}>
              <Skeleton w="45%" h={13} />
              <Skeleton w="30%" h={11} />
            </div>
            <Skeleton w={70}  h={13} r={6} style={{ flexShrink: 0 }} />
            <Skeleton w={80}  h={13} r={6} style={{ flexShrink: 0 }} />
            <Skeleton w={60}  h={26} r={20} style={{ flexShrink: 0 }} />
          </div>
        ))}
      </div>

    </div>
  );
}
