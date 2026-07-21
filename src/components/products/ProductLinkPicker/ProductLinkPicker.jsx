import { Search } from "lucide-react";
import { useState } from "react";
import { ProductPicker } from "../ProductPicker/ProductPicker.jsx";
import "./ProductLinkPicker.scss";

// A plain link-URL text field plus a "Choose Product" button that opens the
// same picker product-type Collections use, in single-select mode (pick one
// row, it confirms immediately). Confirming writes `/products/{slug}` into
// the field — the same path the storefront's product detail route already
// serves, so the banner just works as a Next.js Link with no extra backend
// wiring. The text input stays editable too, for external URLs that aren't
// a product at all.
export function ProductLinkPicker({ value, onChange, metals = [], metalId, disabled = false }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="product-link-picker">
      <input
        disabled={disabled}
        placeholder="https://... or /products/your-product-slug"
        type="text"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        className="product-link-picker__browse"
        disabled={disabled}
        type="button"
        onClick={() => setPickerOpen(true)}
      >
        <Search size={13} /> Choose Product
      </button>

      <ProductPicker
        initialMetalId={metalId}
        metals={metals}
        multiple={false}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={([product]) => onChange(`/products/${product.slug}`)}
      />
    </div>
  );
}
