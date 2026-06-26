import { Search, X } from "lucide-react";
import { useState } from "react";
import { SkeletonShopList } from "../../../../../components/skeleton/SkeletonShopList.jsx";
import { SelectedShopCard } from "./SelectedShopCard.jsx";

const MAX_VISIBLE = 8;

function ShopAvatar({ name }) {
  const initials = (name ?? "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
  return <div className="collection-modal__shop-avatar">{initials || "?"}</div>;
}

export function ShopSearchDropdown({
  results,
  loading,
  query,
  onQueryChange,
  selectedShop,
  onSelectShop,
  metals,
  lastPayment,
  currentRate,
  rateUpdatedAt,
}) {
  const [showAll, setShowAll] = useState(false);

  // Show the list when no shop is selected, or when user is actively typing
  const showList = !selectedShop || query.trim().length > 0;

  const visibleResults = showAll ? results : results.slice(0, MAX_VISIBLE);
  const hasMore = results.length > MAX_VISIBLE && !showAll;

  const handleSelect = (shop) => {
    onSelectShop(shop);
    onQueryChange(""); // clears query → list collapses
    setShowAll(false);
  };

  const handleChange = () => {
    onSelectShop(null);
    onQueryChange("");
    setShowAll(false);
  };

  return (
    <div className="collection-modal__shop-section">
       <button type="button" className="collection-modal__change-btn" onClick={handleChange}>
            <X size={13} />
            Change Shop
          </button>
      {/* Search bar — shown only while browsing/re-searching */}
      {showList && (
        <div className="collection-modal__shop-search-bar">
          <Search size={16} />
          <input
            type="text"
            value={query}
            placeholder="Search by shop name, location, shop ID, phone number, or owner name..."
            onChange={(e) => {
              onQueryChange(e.target.value);
              setShowAll(false);
            }}
          />
        </div>
      )}

      {/* Shop list — visible only when no shop selected or actively searching */}
      {showList && (
        <div className="collection-modal__shop-list-wrap">
          {loading && <SkeletonShopList count={5} />}

          {!loading && visibleResults.length === 0 && (
            <div className="collection-modal__shop-empty">
              {query.length >= 1 ? "No shops match your search." : "No shops found."}
            </div>
          )}

          {!loading &&
            visibleResults.map((shop) => {
              const name = shop.shopName ?? shop.name ?? "";
              const isSelected =
                selectedShop && String(selectedShop.id) === String(shop.id);
              return (
                <div
                  key={shop.id}
                  role="option"
                  aria-selected={isSelected}
                  className={`collection-modal__shop-item${isSelected ? " is-selected" : ""}`}
                  onClick={() => handleSelect(shop)}
                >
                  <ShopAvatar name={name} />
                  <div className="collection-modal__shop-item-info">
                    <div className="collection-modal__shop-item-name">
                      {name}
                      {shop.tier === "PREFERRED" && (
                        <span className="collection-modal__preferred-badge">Preferred</span>
                      )}
                    </div>
                    <div className="collection-modal__shop-item-meta">
                      {[shop.city, shop.state].filter(Boolean).join(", ")}
                    </div>
                    <div className="collection-modal__shop-item-sub">
                      {[shop.shopId, shop.phone, shop.ownerName].filter(Boolean).join(" • ")}
                    </div>
                  </div>
                </div>
              );
            })}

          {hasMore && (
            <button
              type="button"
              className="collection-modal__view-more"
              onClick={() => setShowAll(true)}
            >
              View More Shops
            </button>
          )}
        </div>
      )}

      {/* Selected shop — collapsed state, shown when shop picked and not re-searching */}
      {selectedShop && !showList && (
        <div className="collection-modal__selected-wrap">
          <SelectedShopCard
            shop={selectedShop}
            metals={metals}
            lastPayment={lastPayment}
            currentRate={currentRate}
            rateUpdatedAt={rateUpdatedAt}
          />
        </div>
      )}

    </div>
  );
}
