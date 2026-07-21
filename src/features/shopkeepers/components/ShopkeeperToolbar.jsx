import { RefreshCw } from "lucide-react";
import { Dropdown } from "../../../components/common/Dropdown.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { SearchInput } from "../../../components/common/SearchInput.jsx";
import "./ShopkeeperToolbar.scss";

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Added" },
  { value: "oldest", label: "Oldest" },
  { value: "due_desc", label: "Highest Due" },
  { value: "due_asc", label: "Lowest Due" },
];

// Status filtering now lives above this toolbar as StatusTabs — this only
// handles search and sort.
export function ShopkeeperToolbar({ search, sort, onSearch, onSort, onRefresh }) {
  return (
    <div className="sk-toolbar">
      <SearchInput
        value={search}
        onChange={onSearch}
        placeholder="Search shop name, owner, city, phone, shop ID…"
      />
      <div className="sk-toolbar__controls">
        <Dropdown
          value={sort}
          onChange={onSort}
          options={SORT_OPTIONS}
          label="Sort:"
        />
        <IconButton icon={RefreshCw} size={15} title="Refresh" onClick={onRefresh} />
      </div>
    </div>
  );
}
