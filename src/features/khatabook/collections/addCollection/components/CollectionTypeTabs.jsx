import { Banknote, Scale } from "lucide-react";

const TABS = [
  { value: "gram", label: "Gram (Metal)", icon: Scale },
  { value: "cash", label: "Add Cash",     icon: Banknote },
];

export function CollectionTypeTabs({ activeTab, onTabChange }) {
  return (
    <div className="collection-modal__tabs">
      {TABS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className={`collection-modal__tab${activeTab === value ? " is-active" : ""}`}
          onClick={() => onTabChange(value)}
        >
          <Icon size={17} />
          {label}
        </button>
      ))}
    </div>
  );
}
