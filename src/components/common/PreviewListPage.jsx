import { Download, Filter, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BackendPendingBanner } from "./SectionState.jsx";
import { Button } from "./Button.jsx";
import { Card } from "./Card.jsx";
import { FormAlert } from "./FormAlert.jsx";
import { PageHeader } from "../layout/PageHeader.jsx";
import { DataTable } from "../table/DataTable.jsx";
import { useResourceData } from "../../hooks/useResourceData.js";
import { SkeletonTable } from "../skeleton/SkeletonTable.jsx";
import { apiErrorMessage } from "../../services/apiClient.js";
import "./PreviewListPage.scss";

const emptyQuery = {};

export function PreviewListPage({
  eyebrow,
  title,
  description,
  moduleName,
  columns,
  rows,
  service,
  mapRows,
  query = emptyQuery,
  statusOptions = [],
  filterTabs,
  rowActions,
  onRowClick,
  primaryAction = "Add New",
  onPrimaryAction,
  hidePrimaryAction = false,
  externalError,
  // Opt-in: pass `ids => Promise<{ data: { deletedIds, skipped } }>` (e.g.
  // productService.bulkRemove) to turn on row-selection checkboxes and a
  // "Delete Selected" bar. Omitted entirely for lists that don't need it.
  bulkDeleteAction,
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [tabFilter, setTabFilter] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  // The selection only ever refers to ids on the currently loaded page/filter
  // — clear it whenever any of those shift underneath it, so a stale
  // checkmark can't silently carry over to a different row that reuses the
  // same id slot in the UI.
  useEffect(() => {
    setSelectedIds(new Set());
    setBulkMessage("");
  }, [page, refreshKey, debouncedSearch, status, tabFilter]);

  const params = useMemo(
    () => ({
      page,
      pageSize: 20,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(status ? { status } : {}),
      ...(filterTabs?.paramKey && tabFilter ? { [filterTabs.paramKey]: tabFilter } : {}),
      ...query,
    }),
    [debouncedSearch, filterTabs, page, query, status, tabFilter],
  );
  const resource = useResourceData({
    service,
    previewRows: rows,
    params,
    mapRows,
    refreshKey,
  });

  const refresh = () => setRefreshKey((value) => value + 1);
  const exportRows = () => {
    if (!resource.rows.length) return;
    const headers = columns.map((column) => column.label);
    const lines = resource.rows.map((row) =>
      columns.map((column) => JSON.stringify(row[column.key] ?? "")).join(","),
    );
    const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title.toLowerCase().replaceAll(" ", "-")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const toggleRow = (id) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      resource.rows.forEach((row) => {
        if (checked) next.add(row.id);
        else next.delete(row.id);
      });
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!bulkDeleteAction || selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedIds.size} selected ${title.toLowerCase()}? This action cannot be undone.`,
      )
    ) {
      return;
    }
    setBulkDeleting(true);
    setBulkMessage("");
    try {
      const response = await bulkDeleteAction([...selectedIds]);
      const skipped = response?.data?.skipped ?? [];
      if (skipped.length > 0) {
        setBulkMessage(
          `${skipped.length} item${skipped.length === 1 ? "" : "s"} could not be deleted: ${skipped
            .map((entry) => `${entry.name ?? `#${entry.id}`} (${entry.reason})`)
            .join(", ")}`,
        );
      }
      setSelectedIds(new Set());
      refresh();
    } catch (requestError) {
      setBulkMessage(apiErrorMessage(requestError));
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={exportRows}>
              Export
            </Button>
            {!hidePrimaryAction && (
              <Button icon={Plus} onClick={() => onPrimaryAction?.(refresh)}>
                {primaryAction}
              </Button>
            )}
          </>
        }
      />
      {resource.previewMode && <BackendPendingBanner moduleName={moduleName} />}
      {externalError && <FormAlert>{externalError}</FormAlert>}
      {resource.error && <FormAlert>{resource.error}</FormAlert>}
      {bulkMessage && <FormAlert>{bulkMessage}</FormAlert>}
      <Card className="list-card" padded={false}>
        {bulkDeleteAction && selectedIds.size > 0 && (
          <div className="table-bulk-bar">
            <span>{selectedIds.size} selected</span>
            <div className="table-bulk-bar__actions">
              <button
                className="table-bulk-bar__clear"
                type="button"
                onClick={() => setSelectedIds(new Set())}
              >
                <X size={14} /> Clear
              </button>
              <Button
                icon={Trash2}
                loading={bulkDeleting}
                size="sm"
                variant="danger"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={17} />
            <input
              placeholder={`Search ${title.toLowerCase()}…`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="table-toolbar__actions">
            {filterTabs?.options?.length > 0 && (
              <div className="filter-tabs" role="tablist" aria-label={filterTabs.label}>
                <button
                  aria-selected={!tabFilter}
                  className={!tabFilter ? "is-active" : ""}
                  disabled={resource.loading}
                  role="tab"
                  type="button"
                  onClick={() => {
                    setTabFilter("");
                    setPage(1);
                  }}
                >
                  {filterTabs.allLabel ?? "All"}
                </button>
                {filterTabs.options.map((option) => {
                  const optionValue = String(option.value);
                  const active = tabFilter === optionValue;

                  return (
                    <button
                      aria-selected={active}
                      className={active ? "is-active" : ""}
                      disabled={resource.loading}
                      key={optionValue}
                      role="tab"
                      type="button"
                      onClick={() => {
                        setTabFilter(optionValue);
                        setPage(1);
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
            {statusOptions.length > 0 && (
              <label className="filter-select">
                <Filter size={16} />
                <select
                  disabled={resource.loading}
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button className="filter-button" disabled={resource.loading} onClick={refresh}>
              <RefreshCw className={resource.loading ? "is-spinning" : ""} size={16} />
              Refresh
            </button>
          </div>
        </div>
        {resource.loading ? (
          <SkeletonTable />
        ) : (
          <DataTable
            columns={columns}
            meta={resource.meta}
            onPageChange={setPage}
            onRowClick={onRowClick}
            onToggleAll={toggleAll}
            onToggleRow={toggleRow}
            rowActions={typeof rowActions === "function" ? rowActions({ refresh }) : rowActions}
            rows={resource.rows}
            renderContext={{ refresh }}
            selectable={Boolean(bulkDeleteAction)}
            selectedIds={selectedIds}
          />
        )}
      </Card>
    </div>
  );
}
