import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../common/Button.jsx";
import "../common/IconButton.scss";
import "./DataTable.scss";

export function DataTable({
  columns,
  rows,
  getRowKey = (row) => row.id,
  rowActions = [],
  meta,
  onPageChange,
  renderContext,
}) {
  const [openRow, setOpenRow] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpenRow(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.width ? { width: column.width } : undefined}>
                {column.label}
              </th>
            ))}
            <th className="data-table__actions">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = getRowKey(row);
            const actions = rowActions.filter((action) => !action.hidden?.(row));
            return (
              <tr key={key}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(row[column.key], row, renderContext)
                      : row[column.key]}
                  </td>
                ))}
                <td className="data-table__actions">
                  <button
                    className="icon-button icon-button--subtle"
                    aria-label="Open row actions"
                    onClick={() => setOpenRow((current) => (current === key ? null : key))}
                  >
                    <MoreHorizontal size={17} />
                  </button>
                  {openRow === key && actions.length > 0 && (
                    <div className="row-action-menu" ref={menuRef}>
                      {actions.map((action) => (
                        <button
                          className={action.danger ? "danger" : ""}
                          key={action.label}
                          onClick={() => {
                            setOpenRow(null);
                            action.onClick(row);
                          }}
                        >
                          {action.icon && <action.icon size={14} />}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td className="data-table__empty" colSpan={columns.length + 1}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="table-pagination">
        <span>
          Showing {rows.length ? (meta?.page - 1) * meta.pageSize + 1 : 0}–
          {meta ? Math.min(meta.page * meta.pageSize, meta.totalItems) : rows.length} of{" "}
          {meta?.totalItems ?? rows.length}
        </span>
        <div>
          <Button
            variant="ghost"
            size="sm"
            icon={ChevronLeft}
            disabled={!meta || meta.page <= 1}
            onClick={() => onPageChange?.(meta.page - 1)}
          >
            Previous
          </Button>
          <span className="table-pagination__page">{meta?.page ?? 1}</span>
          <Button
            variant="ghost"
            size="sm"
            icon={ChevronRight}
            disabled={!meta || meta.page >= meta.totalPages}
            onClick={() => onPageChange?.(meta.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
