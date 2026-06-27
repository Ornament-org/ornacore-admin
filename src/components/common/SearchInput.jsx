import { Search, X } from "lucide-react";
import "./SearchInput.scss";

export function SearchInput({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="search-input">
      <Search size={14} className="search-input__icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input__field"
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-input__clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}
