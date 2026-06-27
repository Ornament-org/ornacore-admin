import { ChevronDown } from "lucide-react";
import "./Dropdown.scss";

export function Dropdown({ value, onChange, options, label }) {
  return (
    <div className="dropdown">
      {label && <span className="dropdown__label">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="dropdown__select"
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="dropdown__chevron" />
    </div>
  );
}
