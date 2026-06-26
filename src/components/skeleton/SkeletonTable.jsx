import { Skeleton } from "./Skeleton.jsx";

/* Mirrors DataTable rows inside a PreviewListPage / ReportsPage card */
export function SkeletonTable({ rows = 8, cols = 5 }) {
  /* Column widths cycle through a few sizes for visual variety */
  const colWidths = ["18%", "22%", "15%", "20%", "12%", "10%"];

  return (
    <div className="sk-table-body">
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="sk-table-row">
          {Array.from({ length: cols }).map((__, ci) => (
            <Skeleton
              key={ci}
              style={{ flex: ci === 1 ? 2 : 1, height: 14, width: colWidths[ci % colWidths.length] }}
              r={6}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
