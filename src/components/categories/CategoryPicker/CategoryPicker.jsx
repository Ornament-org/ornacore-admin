import { Check, ImageOff, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "../../common/Modal.jsx";
import { categoryService } from "../../../services/resourceServices.js";
import "./CategoryPicker.scss";

// Category multi-select used by category-type Collections. Owns its own metal
// switcher (rather than requiring the caller to already know a metal), so it
// works the same whether the collection itself is scoped to one metal or to
// "All Metals" — pick a metal here, check off any of its categories, switch
// metals and keep going; picks accumulate across metals into one list.
//
// Selections are tracked as a Map of full category objects (not just IDs),
// keyed by id, so a category picked before a search/metal change stays
// selected even once it scrolls out of the currently-loaded result page.
export function CategoryPicker({
  open,
  onClose,
  onConfirm,
  metals = [],
  initialMetalId,
  initialSelectedCategories = [],
}) {
  const [browseMetalId, setBrowseMetalId] = useState("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMap, setSelectedMap] = useState(() => new Map());

  useEffect(() => {
    if (!open) return;
    setSelectedMap(new Map(initialSelectedCategories.map((category) => [String(category.id), category])));
    setSearch("");
    setBrowseMetalId(String(initialMetalId || metals[0]?.id || ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !browseMetalId) return undefined;
    setLoading(true);
    const timer = setTimeout(() => {
      categoryService
        .list({ metalId: browseMetalId, search: search || undefined, pageSize: 100 })
        .then((response) => setCategories(response.data ?? []))
        .catch(() => setCategories([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [open, browseMetalId, search]);

  if (!open) return null;

  const toggle = (category) => {
    setSelectedMap((current) => {
      const next = new Map(current);
      const key = String(category.id);
      if (next.has(key)) next.delete(key);
      else next.set(key, category);
      return next;
    });
  };

  const allVisibleSelected = categories.length > 0 && categories.every((category) => selectedMap.has(String(category.id)));

  const toggleSelectAll = () => {
    setSelectedMap((current) => {
      const next = new Map(current);
      if (allVisibleSelected) {
        categories.forEach((category) => next.delete(String(category.id)));
      } else {
        categories.forEach((category) => next.set(String(category.id), category));
      }
      return next;
    });
  };

  const confirm = () => {
    onConfirm(Array.from(selectedMap.values()));
    onClose();
  };

  return (
    <Modal open={open} title="Add Categories" onClose={onClose} size="lg">
      <div className="category-picker">
        <div className="category-picker__toolbar">
          <select
            className="category-picker__metal"
            value={browseMetalId}
            onChange={(event) => setBrowseMetalId(event.target.value)}
          >
            {metals.map((metal) => (
              <option key={metal.id} value={metal.id}>
                {metal.name}
              </option>
            ))}
          </select>
          <div className="category-picker__search">
            <Search size={15} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories by name"
            />
          </div>
        </div>

        {categories.length > 0 && (
          <label className="category-picker__select-all">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} />
            Select all {categories.length} shown
          </label>
        )}

        <div className="category-picker__list">
          {loading ? (
            <div className="category-picker__empty">Loading…</div>
          ) : categories.length ? (
            categories.map((category) => {
              const checked = selectedMap.has(String(category.id));
              return (
                <button
                  type="button"
                  key={category.id}
                  className={checked ? "category-picker__row is-selected" : "category-picker__row"}
                  onClick={() => toggle(category)}
                >
                  <span className="category-picker__checkbox">{checked ? <Check size={13} /> : null}</span>
                  <span className="category-picker__thumb">
                    {category.image?.secureUrl ? (
                      <img src={category.image.secureUrl} alt="" />
                    ) : (
                      <ImageOff size={16} />
                    )}
                  </span>
                  <span className="category-picker__name">{category.name}</span>
                </button>
              );
            })
          ) : (
            <div className="category-picker__empty">No categories found for this metal.</div>
          )}
        </div>

        <footer className="category-picker__footer">
          <span>{selectedMap.size ? `${selectedMap.size} selected` : "Nothing selected"}</span>
          <div>
            <button type="button" className="category-picker__cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="category-picker__confirm" onClick={confirm}>
              Use Selected
            </button>
          </div>
        </footer>
      </div>
    </Modal>
  );
}
