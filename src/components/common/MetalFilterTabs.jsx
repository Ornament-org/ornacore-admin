import "./MetalFilterTabs.scss";

export function MetalFilterTabs({
  metals = [],
  value = "",
  allLabel = "All",
  ariaLabel = "Filter by metal",
  counts,
  loading = false,
  onChange,
}) {
  const normalizedValue = value ? String(value) : "";

  return (
    <div className="metal-filter-tabs" role="tablist" aria-label={ariaLabel}>
      <button
        aria-selected={!normalizedValue}
        className={!normalizedValue ? "is-active" : ""}
        disabled={loading}
        role="tab"
        type="button"
        onClick={() => onChange?.("")}
      >
        <span>{allLabel}</span>
        {counts && <small>{counts.all ?? 0}</small>}
      </button>
      {metals.map((metal) => {
        const metalId = String(metal.id);
        const active = normalizedValue === metalId;

        return (
          <button
            aria-selected={active}
            className={active ? "is-active" : ""}
            disabled={loading}
            key={metal.id}
            role="tab"
            type="button"
            onClick={() => onChange?.(metalId)}
          >
            <span>{metal.name}</span>
            {counts && <small>{counts.byMetal?.get(metalId) ?? 0}</small>}
          </button>
        );
      })}
    </div>
  );
}
