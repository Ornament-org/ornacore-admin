import "../../components/skeleton/Skeleton.scss";

/* Full-screen route-level skeleton used by React Suspense */
export function PageLoader() {
  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 1400 }}>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="skeleton" style={{ width: 260, height: 28, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 100, height: 28, borderRadius: 8, marginLeft: "auto" }} />
      </div>

      {/* 4-col KPI strip */}
      <div className="sk-grid-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ background: "#fff", border: "1.5px solid #ece7de", borderRadius: 18, padding: 20, display: "flex", gap: 14, alignItems: "center" }}>
            <div className="skeleton" style={{ width: 50, height: 50, borderRadius: 14, flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="skeleton" style={{ width: "70%", height: 12 }} />
              <div className="skeleton" style={{ width: "85%", height: 22, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: "50%", height: 11 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: "#fff", border: "1.5px solid #ece7de", borderRadius: 20, overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f5f0e8", display: "flex", gap: 12, alignItems: "center" }}>
          <div className="skeleton" style={{ width: 200, height: 36, borderRadius: 10 }} />
          <div className="skeleton" style={{ width: 140, height: 36, borderRadius: 10 }} />
          <div className="skeleton" style={{ width: 90, height: 36, borderRadius: 10, marginLeft: "auto" }} />
        </div>
        {/* Rows */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} style={{ display: "flex", gap: 16, padding: "14px 20px", borderBottom: i < 7 ? "1px solid #f9f5ef" : "none", alignItems: "center" }}>
            {["18%", "24%", "14%", "18%", "12%"].map((w, ci) => (
              <div key={ci} className="skeleton" style={{ width: w, height: 14, borderRadius: 6 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
