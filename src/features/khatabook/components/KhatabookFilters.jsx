import { Filter, Search } from "lucide-react";

export function KhatabookFilters({ metals = [], metalId, search, onMetalChange, onSearchChange }) {
  return (
    <div className="khatabook-filters">
      <select value={metalId ?? ""} onChange={(event) => onMetalChange(event.target.value)}>
        <option value="">All Metals</option>
        {metals.map((row) => (
          <option key={row.metal.id} value={row.metal.id}>
            {row.metal.name}
          </option>
        ))}
      </select>
      <label className="khatabook-search">
        <Search size={17} />
        <input
          value={search}
          placeholder="Search order by ID or note..."
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <button className="khatabook-filter-button" type="button">
        <Filter size={17} />
        Filter
      </button>
      <select aria-label="Sort orders" defaultValue="latest">
        <option value="latest">Sort: Latest First</option>
      </select>
    </div>
  );
}
