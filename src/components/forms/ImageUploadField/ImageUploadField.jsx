import { ImagePlus, X } from "lucide-react";
import { useState } from "react";
import { MediaPicker } from "../../media/MediaPicker/MediaPicker.jsx";
import "./ImageUploadField.scss";

// Single entry point for attaching an image: opens the media library, where the admin
// either picks an existing asset or uploads a new one right there (MediaPicker's own
// "Upload New" button) — no separate direct-upload path, so there's exactly one way in.
// `onSelect` receives the full media row (id, secureUrl, ...) — callers that store a
// URL string (Store Settings logo/favicon) read `.secureUrl`; callers that store a
// mediaId FK (Category image) read `.id`.
export function ImageUploadField({ label, previewUrl, onSelect, onRemove, folder = "library", disabled = false }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="image-upload-field">
      {label ? <span className="image-upload-field__label">{label}</span> : null}
      <div className="image-upload-field__control">
        <div className="image-upload-field__thumb">
          {previewUrl ? <img src={previewUrl} alt="" /> : <ImagePlus size={18} />}
        </div>
        <div className="image-upload-field__actions">
          <button type="button" onClick={() => setPickerOpen(true)} disabled={disabled}>
            <ImagePlus size={14} /> {previewUrl ? "Replace" : "Choose from Library"}
          </button>
          {previewUrl && onRemove ? (
            <button type="button" className="image-upload-field__remove" onClick={onRemove} disabled={disabled}>
              <X size={14} /> Remove
            </button>
          ) : null}
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folder={folder}
        multiple={false}
        title={`Select ${label || "Image"}`}
        onSelect={(asset) => asset && onSelect(asset)}
      />
    </div>
  );
}
