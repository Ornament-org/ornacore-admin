import { Check, ImageOff, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "../../common/Modal.jsx";
import { productService } from "../../../services/resourceServices.js";
import "./ProductPicker.scss";

const primaryImageOf = (product) =>
  product.images?.find((image) => image.isPrimary)?.media?.secureUrl ??
  product.images?.[0]?.media?.secureUrl ??
  null;

// Product picker used by product-type Collections (multi-select) and by
// anything that needs to link to a single product, e.g. a banner's "Link
// to a product" field (single-select via `multiple={false}` — clicking a
// row confirms and closes immediately instead of requiring a "Use Selected"
// step). Owns its own metal switcher (rather than requiring the caller to
// already know a metal), so it works the same whether the parent record is
// scoped to one metal or to "All Metals" — pick a metal here, check off any
// of its products, switch metals and keep going; picks accumulate across
// metals into one list (multi-select mode only).
//
// Selections are tracked as a Map of full product objects (not just IDs),
// keyed by id, so a product picked before a search/metal change stays
// selected even once it scrolls out of the currently-loaded result page.
export function ProductPicker({
  open,
  onClose,
  onConfirm,
  metals = [],
  initialMetalId,
  initialSelectedProducts = [],
  multiple = true,
}) {
  const [browseMetalId, setBrowseMetalId] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMap, setSelectedMap] = useState(() => new Map());

  useEffect(() => {
    if (!open) return;
    setSelectedMap(new Map(initialSelectedProducts.map((product) => [String(product.id), product])));
    setSearch("");
    setBrowseMetalId(String(initialMetalId || metals[0]?.id || ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !browseMetalId) return undefined;
    setLoading(true);
    const timer = setTimeout(() => {
      productService
        .list({ metalId: browseMetalId, search: search || undefined, pageSize: 60 })
        .then((response) => setProducts(response.data ?? []))
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [open, browseMetalId, search]);

  if (!open) return null;

  const toggle = (product) => {
    if (!multiple) {
      onConfirm([product]);
      onClose();
      return;
    }
    setSelectedMap((current) => {
      const next = new Map(current);
      const key = String(product.id);
      if (next.has(key)) next.delete(key);
      else next.set(key, product);
      return next;
    });
  };

  const allVisibleSelected = products.length > 0 && products.every((product) => selectedMap.has(String(product.id)));

  const toggleSelectAll = () => {
    setSelectedMap((current) => {
      const next = new Map(current);
      if (allVisibleSelected) {
        products.forEach((product) => next.delete(String(product.id)));
      } else {
        products.forEach((product) => next.set(String(product.id), product));
      }
      return next;
    });
  };

  const confirm = () => {
    onConfirm(Array.from(selectedMap.values()));
    onClose();
  };

  return (
    <Modal open={open} title={multiple ? "Add Products" : "Choose a Product"} onClose={onClose} size="lg">
      <div className="product-picker">
        <div className="product-picker__toolbar">
          <select
            className="product-picker__metal"
            value={browseMetalId}
            onChange={(event) => setBrowseMetalId(event.target.value)}
          >
            {metals.map((metal) => (
              <option key={metal.id} value={metal.id}>
                {metal.name}
              </option>
            ))}
          </select>
          <div className="product-picker__search">
            <Search size={15} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products by name or design code"
            />
          </div>
        </div>

        {multiple && products.length > 0 && (
          <label className="product-picker__select-all">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} />
            Select all {products.length} shown
          </label>
        )}

        <div className="product-picker__list">
          {loading ? (
            <div className="product-picker__empty">Loading…</div>
          ) : products.length ? (
            products.map((product) => {
              const checked = multiple && selectedMap.has(String(product.id));
              return (
                <button
                  type="button"
                  key={product.id}
                  className={checked ? "product-picker__row is-selected" : "product-picker__row"}
                  onClick={() => toggle(product)}
                >
                  {multiple && (
                    <span className="product-picker__checkbox">{checked ? <Check size={13} /> : null}</span>
                  )}
                  <span className="product-picker__thumb">
                    {primaryImageOf(product) ? (
                      <img src={primaryImageOf(product)} alt="" />
                    ) : (
                      <ImageOff size={16} />
                    )}
                  </span>
                  <span className="product-picker__name">{product.name}</span>
                </button>
              );
            })
          ) : (
            <div className="product-picker__empty">No products found for this metal.</div>
          )}
        </div>

        {multiple && (
          <footer className="product-picker__footer">
            <span>{selectedMap.size ? `${selectedMap.size} selected` : "Nothing selected"}</span>
            <div>
              <button type="button" className="product-picker__cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="product-picker__confirm" onClick={confirm}>
                Use Selected
              </button>
            </div>
          </footer>
        )}
      </div>
    </Modal>
  );
}
