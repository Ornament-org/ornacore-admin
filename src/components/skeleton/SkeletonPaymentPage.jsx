import { Skeleton } from "./Skeleton.jsx";

/* Mirrors AddReceivedPaymentPage: header + form fields */
export function SkeletonPaymentPage() {
  return (
    <div className="sk-page">
      {/* Header */}
      <div className="sk-col" style={{ gap: 10 }}>
        <Skeleton w={220} h={28} r={8} />
        <Skeleton w={340} h={14} r={6} />
      </div>

      {/* Metal selector */}
      <div className="sk-row" style={{ gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} w={90} h={36} r={10} />
        ))}
      </div>

      {/* Form card */}
      <div className="sk-card sk-col" style={{ gap: 18 }}>
        {/* Collection type tabs */}
        <div className="sk-row" style={{ gap: 8 }}>
          <Skeleton w={110} h={38} r={10} />
          <Skeleton w={110} h={38} r={10} />
        </div>

        {/* Fields */}
        {[0, 1, 2].map((i) => (
          <div key={i} className="sk-col" style={{ gap: 8 }}>
            <Skeleton w={100} h={13} r={6} />
            <Skeleton w="100%" h={44} r={12} />
          </div>
        ))}

        {/* Calc box */}
        <div style={{ background: "#fdfaf6", border: "1.5px solid #ece7de", borderRadius: 14, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="sk-row" style={{ justifyContent: "space-between" }}>
              <Skeleton w="30%" h={13} />
              <Skeleton w="20%" h={13} />
            </div>
          ))}
          <div style={{ borderTop: "1px solid #ece7de", paddingTop: 12 }}>
            <div className="sk-row" style={{ justifyContent: "space-between" }}>
              <Skeleton w="25%" h={16} />
              <Skeleton w="22%" h={16} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <Skeleton w={160} h={44} r={12} style={{ alignSelf: "flex-end" }} />
      </div>
    </div>
  );
}
