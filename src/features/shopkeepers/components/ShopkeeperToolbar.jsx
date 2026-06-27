import { RefreshCw } from "lucide-react";
import { Dropdown } from "../../../components/common/Dropdown.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { SearchInput } from "../../../components/common/SearchInput.jsx";
import "./ShopkeeperToolbar.scss";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING_REVIEW", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Added" },
  { value: "oldest", label: "Oldest" },
  { value: "due_desc", label: "Highest Due" },
  { value: "due_asc", label: "Lowest Due" },
];

export function ShopkeeperToolbar({
  search,
  status,
  sort,
  onSearch,
  onStatus,
  onSort,
  onRefresh,
  hideStatusFilter = false,
}) {
  return (
    <div className="sk-toolbar">
      <SearchInput
        value={search}
        onChange={onSearch}
        placeholder="Search shop name, owner, city, phone, shop ID…"
      />
      <div className="sk-toolbar__controls">
        {!hideStatusFilter && (
          <Dropdown
            value={status}
            onChange={onStatus}
            options={STATUS_OPTIONS}
            label="Status:"
          />
        )}
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
