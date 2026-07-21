import { Plus, X } from "lucide-react";
import { useState } from "react";
import { MediaPicker } from "../../../components/media/MediaPicker/MediaPicker.jsx";

// images: [{ key, mediaId, secureUrl, productImageId? }] — entries with a productImageId
// are already attached to the product (existing ProductImage rows); entries without one
// are freshly picked from the library this session and get attached via addImages on save.
export function ProductMediaGallery({ images, maxImages, onAdd, onRemove }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="product-media-gallery">
      <div className="product-media-grid">
        {images.map((image, index) => (
          <article className="product-media-tile" key={image.key}>
            <img alt={`Product image ${index + 1}`} src={image.secureUrl} />
            <span>{index === 0 ? "Primary" : `Image ${index + 1}`}</span>
            <button
              aria-label={`Remove image ${index + 1}`}
              type="button"
              onClick={() => onRemove(image.key)}
            >
              <X size={14} />
            </button>
          </article>
        ))}
        {images.length < maxImages && (
          <button type="button" className="product-media-upload" onClick={() => setPickerOpen(true)}>
            <span>
              <Plus size={25} />
            </span>
            <strong>Add images</strong>
            <small>Choose from library or upload new</small>
          </button>
        )}
      </div>
      <p className="product-media-help">
        {images.length}/{maxImages} images · first image is the Primary image
      </p>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folder="products"
        multiple
        title="Select product images"
        onSelect={(assets) => {
          const room = Math.max(maxImages - images.length, 0);
          const picked = (assets ?? []).slice(0, room);
          if (picked.length) onAdd(picked.map((asset) => ({ mediaId: asset.id, secureUrl: asset.secureUrl })));
        }}
      />
    </div>
  );
}
