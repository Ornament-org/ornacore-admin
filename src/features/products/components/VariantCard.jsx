import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";

const MAX_VARIANT_IMAGES = 5;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function Field({ label, required = false, hint, className, children }) {
  return (
    <label className={`product-field ${className || ""}`}>
      <span>
        {label} {required && <em>*</em>}
      </span>
      {children}
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  );
}

function formatMoney(value) {
  if (value === "" || value === null || value === undefined) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function VariantCard({
  variant,
  collapsible = false,
  expanded = true,
  showAttributes = false,
  showRemove = false,
  showImages = false,
  onToggleExpand,
  onFieldChange,
  onTunchChange,
  onRemove,
  onAddImages,
  onRemoveNewImage,
  onRemoveExistingImage,
}) {
  const totalImages = (variant.existingImages?.length ?? 0) + (variant.imageFiles?.length ?? 0);
  const isOpen = !collapsible || expanded;

  const handleFileInput = (event) => {
    const files = Array.from(event.target.files ?? []);
    const invalid = files.find((file) => !ACCEPTED_IMAGE_TYPES.has(file.type));
    if (invalid) {
      event.target.value = "";
      return;
    }
    onAddImages(files.slice(0, Math.max(MAX_VARIANT_IMAGES - totalImages, 0)));
    event.target.value = "";
  };

  const handleHeaderKeyDown = (event) => {
    if (!collapsible) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggleExpand?.();
    }
  };

  const summaryParts = [
    variant.sku,
    variant.purity,
    formatMoney(variant.basePrice),
    variant.openingStock !== "" ? `Stock: ${variant.openingStock}` : null,
  ].filter(Boolean);

  return (
    <div className={`variant-card ${collapsible && !isOpen ? "is-collapsed" : ""}`}>
      <div
        className="variant-card__header"
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onClick={collapsible ? onToggleExpand : undefined}
        onKeyDown={handleHeaderKeyDown}
      >
        <div className="variant-card__header-main">
          {showAttributes && variant.attributes ? (
            <div className="variant-card__chips">
              {Object.entries(variant.attributes).map(([name, value]) => (
                <span className="variant-card__chip" key={name}>
                  <b>{name}:</b> {value}
                </span>
              ))}
            </div>
          ) : (
            <strong>Default variant</strong>
          )}
          {collapsible && !isOpen && summaryParts.length > 0 && (
            <span className="variant-card__summary">{summaryParts.join(" · ")}</span>
          )}
        </div>
        <div className="variant-card__header-actions">
          {showRemove && (
            <button
              aria-label="Remove variant"
              className="variant-card__remove"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
            >
              <X size={14} />
            </button>
          )}
          {collapsible && (
            <span className="variant-card__chevron" aria-hidden="true">
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          )}
        </div>
      </div>

      {isOpen && (
        <>
          <div className="product-form-grid product-form-grid--compact">
            <Field
              className="variant-field--sku"
              hint="Auto-generated from metal + category. Edit anytime."
              label="SKU"
              required
            >
              <input
                value={variant.sku}
                onChange={(event) => onFieldChange("sku", event.target.value, { skuAuto: false })}
              />
            </Field>
            <Field label="Tunch">
              <input
                min="0"
                max="100"
                placeholder="e.g. 91.6"
                step="0.01"
                type="number"
                value={variant.tunch}
                onChange={(event) => onTunchChange(event.target.value)}
              />
            </Field>
            <Field hint="Calculated automatically from Tunch." label="Purity / Karat">
              <input readOnly placeholder="Enter tunch first" value={variant.purity} />
            </Field>
            <Field hint="Visible to customers only, never to shopkeepers." label="Public Purity / Karat">
              <input
                placeholder="e.g. 22K Hallmark"
                value={variant.publicPurity}
                onChange={(event) => onFieldChange("publicPurity", event.target.value)}
              />
            </Field>
            <Field label="Weight (grams)">
              <input
                min="0"
                step="0.001"
                type="number"
                value={variant.weightGrams}
                onChange={(event) => onFieldChange("weightGrams", event.target.value)}
              />
            </Field>
            <Field label="Base price (INR)">
              <input
                min="0"
                step="0.01"
                type="number"
                value={variant.basePrice}
                onChange={(event) => onFieldChange("basePrice", event.target.value)}
              />
            </Field>
            <Field label="Opening stock" required>
              <input
                min="0"
                step="0.001"
                type="number"
                value={variant.openingStock}
                onChange={(event) => onFieldChange("openingStock", event.target.value)}
              />
            </Field>
            <Field label="Low stock threshold" required>
              <input
                min="0"
                step="0.001"
                type="number"
                value={variant.reorderLevel}
                onChange={(event) => onFieldChange("reorderLevel", event.target.value)}
              />
            </Field>
          </div>

          {showImages && (
            <div className="variant-card__images">
              <div className="variant-media-grid">
                {(variant.existingImages ?? []).map((image, index) => (
                  <article className="variant-media-tile" key={`existing-${image.id}`}>
                    <img alt={image.altText || `Variant image ${index + 1}`} src={image.media?.secureUrl} />
                    <button
                      aria-label={`Remove saved variant image ${index + 1}`}
                      type="button"
                      onClick={() => onRemoveExistingImage(image.id)}
                    >
                      <X size={12} />
                    </button>
                  </article>
                ))}
                {(variant.imageFiles ?? []).map((entry, index) => (
                  <article className="variant-media-tile" key={entry.id}>
                    <img alt={`Variant preview ${index + 1}`} src={entry.previewUrl} />
                    <button
                      aria-label={`Remove selected variant image ${index + 1}`}
                      type="button"
                      onClick={() => onRemoveNewImage(entry.id)}
                    >
                      <X size={12} />
                    </button>
                  </article>
                ))}
                {totalImages < MAX_VARIANT_IMAGES && (
                  <label className="variant-media-upload">
                    <Plus size={16} />
                    <span>Add image</span>
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      multiple
                      type="file"
                      onChange={handleFileInput}
                    />
                  </label>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
