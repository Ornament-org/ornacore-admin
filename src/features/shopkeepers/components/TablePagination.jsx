import { ChevronLeft, ChevronRight } from "lucide-react";
import "./TablePagination.scss";

function pageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export function TablePagination({ page, total, pageSize, onChange, noun = "shopkeepers" }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = pageRange(page, totalPages);

  return (
    <div className="table-pagination">
      <span className="table-pagination__info">
        Showing {from}–{to} of {total} {noun}
      </span>
      <div className="table-pagination__controls">
        <button
          type="button"
          className="table-pagination__btn"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          typeof p === "string" ? (
            <span key={`ellipsis-${i}`} className="table-pagination__ellipsis">
              {p}
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`table-pagination__btn${p === page ? " table-pagination__btn--active" : ""}`}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          className="table-pagination__btn"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
