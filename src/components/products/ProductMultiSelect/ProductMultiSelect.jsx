import { ImagePlus, Plus, X } from "lucide-react";
import { useState } from "react";
import { ProductPicker } from "../ProductPicker/ProductPicker.jsx";
import "./ProductMultiSelect.scss";

const primaryImageOf = (product) =>
  product?.images?.find((image) => image.isPrimary)?.media?.secureUrl ??
  product?.images?.[0]?.media?.secureUrl ??
  product?.image?.secureUrl ??
  null;

// Self-contained product picker field, mirroring how ImageUploadField wraps
// MediaPicker: the trigger button and modal live together so any form can
// drop this in as one custom field. The picker owns its own metal switcher,
// so this works the same whether the parent record is scoped to one metal or
// to "All Metals".
export function ProductMultiSelect({ selectedProducts = [], metals = [], metalId, onChange, disabled = false }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="product-multi-select">
      <div className="product-multi-select__chips">
        {selectedProducts.map((product) => (
          <span key={product.id} className="product-multi-select__chip">
            <span className="product-multi-select__chip-thumb">
              {primaryImageOf(product) ? (
                <img src={primaryImageOf(product)} alt="" />
              ) : (
                <ImagePlus size={12} />
              )}
            </span>
            {product.name}
            <button
              type="button"
              onClick={() =>
                onChange(
                  selectedProducts.filter((item) => String(item.id) !== String(product.id)),
                )
              }
              aria-label={`Remove ${product.name}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {!selectedProducts.length ? (
          <span className="product-multi-select__empty">No products added yet.</span>
        ) : null}
      </div>

      <button
        type="button"
        className="product-multi-select__add"
        onClick={() => setPickerOpen(true)}
        disabled={disabled}
      >
        <Plus size={14} /> Add Products
      </button>

      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        metals={metals}
        initialMetalId={metalId}
        initialSelectedProducts={selectedProducts}
        onConfirm={(pickedProducts) => onChange(pickedProducts)}
      />
    </div>
  );
}
