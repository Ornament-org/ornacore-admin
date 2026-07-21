import { ImagePlus, Plus, X } from "lucide-react";
import { useState } from "react";
import { CategoryPicker } from "../CategoryPicker/CategoryPicker.jsx";
import "./CategoryMultiSelect.scss";

// Self-contained category picker field, mirroring ProductMultiSelect: the
// trigger button and modal live together so any form can drop this in as one
// custom field. The picker owns its own metal switcher, so this works the
// same whether the parent record is scoped to one metal or to "All Metals".
export function CategoryMultiSelect({ selectedCategories = [], metals = [], metalId, onChange, disabled = false }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="category-multi-select">
      <div className="category-multi-select__chips">
        {selectedCategories.map((category) => (
          <span key={category.id} className="category-multi-select__chip">
            <span className="category-multi-select__chip-thumb">
              {category.image?.secureUrl ? (
                <img src={category.image.secureUrl} alt="" />
              ) : (
                <ImagePlus size={12} />
              )}
            </span>
            {category.name}
            <button
              type="button"
              onClick={() =>
                onChange(
                  selectedCategories.filter((item) => String(item.id) !== String(category.id)),
                )
              }
              aria-label={`Remove ${category.name}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {!selectedCategories.length ? (
          <span className="category-multi-select__empty">No categories added yet.</span>
        ) : null}
      </div>

      <button
        type="button"
        className="category-multi-select__add"
        onClick={() => setPickerOpen(true)}
        disabled={disabled}
      >
        <Plus size={14} /> Add Categories
      </button>

      <CategoryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        metals={metals}
        initialMetalId={metalId}
        initialSelectedCategories={selectedCategories}
        onConfirm={(pickedCategories) => onChange(pickedCategories)}
      />
    </div>
  );
}
