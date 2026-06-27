import {
  CheckCircle,
  Clock,
  Flag,
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  ScrollText,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { featureFlagService } from "../../../services/resourceServices.js";
import "../FeatureFlags.scss";

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULE_COLORS = {
  Platform:      { bg: "#ede9fe", text: "#7c3aed" },
  System:        { bg: "#dbeafe", text: "#1d4ed8" },
  Shopkeeper:    { bg: "#fef3c7", text: "#b45309" },
  Khatabook:     { bg: "#d1fae5", text: "#059669" },
  Notifications: { bg: "#fef9c3", text: "#ca8a04" },
  Orders:        { bg: "#dbeafe", text: "#2563eb" },
  Metals:        { bg: "#dcfce7", text: "#16a34a" },
  Inventory:     { bg: "#f3e8ff", text: "#9333ea" },
  Payments:      { bg: "#fff7ed", text: "#ea580c" },
  Reports:       { bg: "#f0fdf4", text: "#15803d" },
};

const getModuleStyle = (mod) =>
  MODULE_COLORS[mod] ?? { bg: "#f3f4f6", text: "#374151" };

const COMMON_MODULES = Object.keys(MODULE_COLORS);

const relativeTime = (d) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "—";

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`ff-toggle${checked ? " ff-toggle--on" : ""}${disabled ? " ff-toggle--disabled" : ""}`}
    >
      <span className="ff-toggle__thumb" />
    </button>
  );
}

// ─── Stats cards ──────────────────────────────────────────────────────────────

function StatsCards({ stats, loading }) {
  const actorName = stats?.lastUpdatedBy?.split("@")[0] ?? "—";

  const cards = [
    {
      label: "Total Feature Flags",
      value: loading ? "…" : stats?.total ?? 0,
      sub: "All configured flags",
      Icon: Layers,
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
    },
    {
      label: "Enabled",
      value: loading ? "…" : stats?.enabled ?? 0,
      sub: "Currently enabled flags",
      Icon: CheckCircle,
      iconBg: "#dcfce7",
      iconColor: "#16a34a",
    },
    {
      label: "Disabled",
      value: loading ? "…" : stats?.disabled ?? 0,
      sub: "Currently disabled flags",
      Icon: XCircle,
      iconBg: "#fee2e2",
      iconColor: "#dc2626",
    },
    {
      label: "Last Updated",
      value: loading ? "…" : relativeTime(stats?.lastUpdatedAt),
      sub: `By ${actorName}`,
      Icon: Clock,
      iconBg: "#fef3c7",
      iconColor: "#d97706",
    },
  ];

  return (
    <div className="ff-stats">
      {cards.map((c) => (
        <div key={c.label} className="ff-stat-card">
          <div className="ff-stat-card__icon" style={{ background: c.iconBg, color: c.iconColor }}>
            <c.Icon size={20} />
          </div>
          <div className="ff-stat-card__body">
            <div className="ff-stat-card__label">{c.label}</div>
            <div className="ff-stat-card__value">{c.value}</div>
            <div className="ff-stat-card__sub">{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Flag form modal ──────────────────────────────────────────────────────────

function FlagFormModal({ flag, moduleOptions, onClose, onSaved }) {
  const isEdit = Boolean(flag);
  const [form, setForm] = useState({
    key:               flag?.key ?? "",
    name:              flag?.name ?? "",
    module:            flag?.module ?? "",
    description:       flag?.description ?? "",
    environment:       flag?.environment ?? "all",
    targetAudience:    flag?.targetAudience ?? "all",
    rolloutPercentage: flag?.rolloutPercentage ?? 100,
    isEnabled:         flag?.isEnabled ?? false,
    topPriority:       flag?.metadata?.tags?.includes("TOP_PRIORITY") ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const setKey = (e) =>
    setForm((f) => ({
      ...f,
      key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
    }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const tags = form.topPriority ? ["TOP_PRIORITY"] : [];
      const payload = {
        key:               form.key,
        name:              form.name,
        module:            form.module || null,
        description:       form.description || null,
        environment:       form.environment,
        targetAudience:    form.targetAudience,
        rolloutPercentage: Number(form.rolloutPercentage),
        isEnabled:         Boolean(form.isEnabled),
        metadata:          tags.length ? { tags } : null,
      };
      if (isEdit) {
        await featureFlagService.update(flag.id, payload);
      } else {
        await featureFlagService.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err) || "Failed to save flag.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ff-modal__overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ff-modal">
        <div className="ff-modal__header">
          <h2>{isEdit ? "Edit Feature Flag" : "Create Feature Flag"}</h2>
          <button type="button" className="ff-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="ff-modal__body" onSubmit={submit}>
          <div className="ff-modal__row">
            <div className="ff-modal__field">
              <label>Key <span>*</span></label>
              <input
                value={form.key}
                onChange={setKey}
                placeholder="e.g. feature.enabled"
                disabled={isEdit}
                required
              />
              <small>Lowercase, letters/numbers/_ . - only. Cannot change after creation.</small>
            </div>
            <div className="ff-modal__field">
              <label>Display name <span>*</span></label>
              <input value={form.name} onChange={set("name")} placeholder="My Feature" required />
            </div>
          </div>

          <div className="ff-modal__row">
            <div className="ff-modal__field">
              <label>Module</label>
              <input
                list="ff-module-list"
                value={form.module}
                onChange={set("module")}
                placeholder="e.g. Platform"
              />
              <datalist id="ff-module-list">
                {moduleOptions.map((m) => <option key={m} value={m} />)}
                {COMMON_MODULES.filter((m) => !moduleOptions.includes(m)).map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
            <div className="ff-modal__field">
              <label>Environment</label>
              <select value={form.environment} onChange={set("environment")}>
                {["all", "web", "mobile", "server"].map((e) => (
                  <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ff-modal__field">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              placeholder="What does this flag control?"
              rows={3}
            />
          </div>

          <div className="ff-modal__row">
            <div className="ff-modal__field">
              <label>Target audience</label>
              <select value={form.targetAudience} onChange={set("targetAudience")}>
                {[["all", "Everyone"], ["admin", "Admins only"], ["shopkeeper", "Shopkeepers"]].map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="ff-modal__field">
              <label>Rollout %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.rolloutPercentage}
                onChange={set("rolloutPercentage")}
              />
            </div>
          </div>

          <div className="ff-modal__checkboxes">
            <label className="ff-modal__check">
              <input
                type="checkbox"
                checked={form.isEnabled}
                onChange={(e) => setForm((f) => ({ ...f, isEnabled: e.target.checked }))}
              />
              <span>Start enabled</span>
            </label>
            <label className="ff-modal__check">
              <input
                type="checkbox"
                checked={form.topPriority}
                onChange={(e) => setForm((f) => ({ ...f, topPriority: e.target.checked }))}
              />
              <span>Mark as TOP PRIORITY</span>
            </label>
          </div>

          {error && <div className="ff-modal__error">{error}</div>}

          <div className="ff-modal__footer">
            <button type="button" className="ff-btn ff-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="ff-btn ff-btn--primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create flag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ flag, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState("");

  const confirm = async () => {
    setDeleting(true);
    try {
      await featureFlagService.remove(flag.id);
      onDeleted();
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err) || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ff-modal__overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ff-modal ff-modal--sm">
        <div className="ff-modal__header">
          <h2>Delete flag?</h2>
          <button type="button" className="ff-modal__close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="ff-modal__body">
          <p className="ff-delete-msg">
            This will permanently delete <strong>{flag.key}</strong> and all its audit history.
          </p>
          {error && <div className="ff-modal__error">{error}</div>}
          <div className="ff-modal__footer">
            <button type="button" className="ff-btn ff-btn--ghost" onClick={onClose}>Cancel</button>
            <button type="button" className="ff-btn ff-btn--danger" onClick={confirm} disabled={deleting}>
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Flag row ─────────────────────────────────────────────────────────────────

function FlagRow({ flag, onEdit, onDelete, onToggled }) {
  const [toggling, setToggling] = useState(false);
  const isTopPriority = flag.metadata?.tags?.includes("TOP_PRIORITY");
  const modStyle = flag.module ? getModuleStyle(flag.module) : null;
  const actorName = flag.lastActor?.email?.split("@")[0] ?? "Super Admin";

  const handleToggle = async () => {
    setToggling(true);
    try {
      await featureFlagService.toggle(flag.id);
      onToggled();
    } catch {
      /* noop */
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className={`ff-row${isTopPriority ? " ff-row--priority" : ""}`}>
      {/* Feature */}
      <div className="ff-row__feature">
        <div className="ff-row__feature-title">
          <strong>{flag.name}</strong>
          {isTopPriority && (
            <span className="ff-priority-badge">TOP PRIORITY</span>
          )}
        </div>
        {flag.description && (
          <span className="ff-row__desc">{flag.description}</span>
        )}
      </div>

      {/* Key */}
      <div className="ff-row__key">
        <code className="ff-key-chip">{flag.key}</code>
      </div>

      {/* Module */}
      <div className="ff-row__module">
        {modStyle ? (
          <span
            className="ff-module-badge"
            style={{ background: modStyle.bg, color: modStyle.text }}
          >
            {flag.module}
          </span>
        ) : (
          <span className="ff-row__na">—</span>
        )}
      </div>

      {/* Status */}
      <div className="ff-row__status">
        <Toggle checked={flag.isEnabled} onChange={handleToggle} disabled={toggling} />
        <span className={`ff-status-text${flag.isEnabled ? " ff-status-text--on" : " ff-status-text--off"}`}>
          {flag.isEnabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      {/* Value */}
      <div className="ff-row__value">
        <span className={`ff-value-chip${flag.isEnabled ? " ff-value-chip--true" : " ff-value-chip--false"}`}>
          {flag.isEnabled ? "true" : "false"}
        </span>
      </div>

      {/* Updated At */}
      <div className="ff-row__updated">
        <span className="ff-row__updated-date">{fmtDate(flag.updatedAt)}</span>
        <span className="ff-row__updated-by">{actorName}</span>
      </div>

      {/* Actions */}
      <div className="ff-row__actions">
        <button type="button" className="ff-icon-btn" title="Edit" onClick={() => onEdit(flag)}>
          <Pencil size={13} />
        </button>
        <button type="button" className="ff-icon-btn ff-icon-btn--danger" title="Delete" onClick={() => onDelete(flag)}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
  const from = Math.min((page - 1) * pageSize + 1, totalItems);
  const to   = Math.min(page * pageSize, totalItems);

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="ff-pagination">
      <span className="ff-pagination__info">
        Showing {from} to {to} of {totalItems} results
      </span>
      <div className="ff-pagination__pages">
        <button
          type="button"
          className="ff-page-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          &lsaquo;
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`ff-page-btn${p === page ? " ff-page-btn--active" : ""}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className="ff-page-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          &rsaquo;
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

export function FeatureFlagsPage() {
  const navigate = useNavigate();

  const [flags, setFlags]           = useState([]);
  const [stats, setStats]           = useState(null);
  const [moduleOptions, setModuleOptions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);

  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [sortBy, setSortBy]           = useState("updatedAt");

  const [createOpen, setCreateOpen] = useState(false);
  const [editFlag, setEditFlag]     = useState(null);
  const [deleteFlag, setDeleteFlag] = useState(null);

  const debounceRef = useRef(null);

  const fetchStats = useCallback(() => {
    setStatsLoading(true);
    featureFlagService
      .stats()
      .then((res) => setStats(res.data ?? null))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const fetchModules = useCallback(() => {
    featureFlagService
      .modules()
      .then((res) => setModuleOptions(res.data ?? []))
      .catch(() => {});
  }, []);

  const fetchFlags = useCallback(
    (params = {}) => {
      setLoading(true);
      featureFlagService
        .list({ page, pageSize: PAGE_SIZE, sortBy, sortDirection: "DESC", ...params })
        .then((res) => {
          setFlags(res.data ?? []);
          setTotalItems(res.meta?.totalItems ?? 0);
          setTotalPages(res.meta?.totalPages ?? 1);
        })
        .catch(() => setFlags([]))
        .finally(() => setLoading(false));
    },
    [page, sortBy],
  );

  const buildParams = useCallback(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(filterStatus ? { isEnabled: filterStatus } : {}),
      ...(filterModule ? { module: filterModule } : {}),
      sortBy,
      sortDirection: "DESC",
    }),
    [page, search, filterStatus, filterModule, sortBy],
  );

  const refresh = useCallback(() => {
    fetchFlags(buildParams());
    fetchStats();
    fetchModules();
  }, [fetchFlags, buildParams, fetchStats, fetchModules]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(refresh, 250);
    return () => clearTimeout(debounceRef.current);
  }, [refresh]);

  const handlePageChange = (p) => setPage(p);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <div className="ff-page">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="ff-page__header">
        <div>
          <h1 className="ff-page__title">Feature Flags</h1>
          <p className="ff-page__desc">
            Manage and control application features using feature flags.
          </p>
        </div>
        <div className="ff-page__actions">
          <button
            type="button"
            className="ff-btn ff-btn--ghost"
            onClick={() => navigate("/audit-logs")}
          >
            <ScrollText size={14} />
            Audit Logs
          </button>
          <button
            type="button"
            className="ff-btn ff-btn--primary"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={14} />
            Create New Flag
          </button>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <StatsCards stats={stats} loading={statsLoading} />

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="ff-toolbar">
        <div className="ff-search-wrap">
          <Search size={14} className="ff-search-icon" />
          <input
            type="text"
            className="ff-search"
            placeholder="Search by key or name..."
            value={search}
            onChange={handleFilterChange(setSearch)}
          />
        </div>

        <select
          className="ff-filter-select"
          value={filterStatus}
          onChange={handleFilterChange(setFilterStatus)}
        >
          <option value="">All Status</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>

        <select
          className="ff-filter-select"
          value={filterModule}
          onChange={handleFilterChange(setFilterModule)}
        >
          <option value="">All Modules</option>
          {[...new Set([...moduleOptions, ...COMMON_MODULES])].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <div className="ff-sort-wrap">
          <select
            className="ff-filter-select ff-sort-select"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          >
            <option value="updatedAt">Sort by: Latest Updated</option>
            <option value="createdAt">Sort by: Created</option>
            <option value="name">Sort by: Name</option>
          </select>
        </div>

        <button type="button" className="ff-icon-btn" title="Refresh" onClick={refresh}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="ff-table">
        <div className="ff-table__head">
          <span>Feature</span>
          <span>Key</span>
          <span>Module</span>
          <span>Status</span>
          <span>Value</span>
          <span>Updated At</span>
          <span>Actions</span>
        </div>

        <div className="ff-table__body">
          {loading ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="ff-row ff-row--shimmer">
                <div className="ff-shimmer" />
                <div className="ff-shimmer ff-shimmer--sm" />
                <div className="ff-shimmer ff-shimmer--xs" />
                <div className="ff-shimmer ff-shimmer--sm" />
                <div className="ff-shimmer ff-shimmer--xs" />
                <div className="ff-shimmer ff-shimmer--sm" />
                <div className="ff-shimmer ff-shimmer--xs" />
              </div>
            ))
          ) : flags.length === 0 ? (
            <div className="ff-empty">
              <Flag size={36} />
              <p>No feature flags found.</p>
              <button
                type="button"
                className="ff-btn ff-btn--primary"
                onClick={() => setCreateOpen(true)}
              >
                <Plus size={14} /> Create first flag
              </button>
            </div>
          ) : (
            flags.map((flag) => (
              <FlagRow
                key={flag.id}
                flag={flag}
                onEdit={setEditFlag}
                onDelete={setDeleteFlag}
                onToggled={refresh}
              />
            ))
          )}
        </div>

        {!loading && totalItems > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* ── Info box ──────────────────────────────────────────────────────── */}
      <div className="ff-info-box">
        <div className="ff-info-box__left">
          <Flag size={16} className="ff-info-box__icon" />
          <div>
            <strong>What are Feature Flags?</strong>
            <p>
              Feature flags let you turn features on or off without deploying code. They help
              in A/B testing, gradual rollouts, and controlling access.
            </p>
          </div>
        </div>
        <a
          href="https://martinfowler.com/articles/feature-toggles.html"
          target="_blank"
          rel="noopener noreferrer"
          className="ff-btn ff-btn--ghost ff-btn--sm"
        >
          Learn More
        </a>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {createOpen && (
        <FlagFormModal
          moduleOptions={moduleOptions}
          onClose={() => setCreateOpen(false)}
          onSaved={refresh}
        />
      )}
      {editFlag && (
        <FlagFormModal
          flag={editFlag}
          moduleOptions={moduleOptions}
          onClose={() => setEditFlag(null)}
          onSaved={refresh}
        />
      )}
      {deleteFlag && (
        <DeleteConfirm flag={deleteFlag} onClose={() => setDeleteFlag(null)} onDeleted={refresh} />
      )}
    </div>
  );
}
