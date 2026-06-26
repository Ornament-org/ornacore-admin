import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../components/common/Button.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { Modal } from "../../../components/common/Modal.jsx";
import { StatusToggle } from "../../../components/common/StatusToggle.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { mediaService } from "../../../services/resourceServices.js";
import { getPersistedMetalId, persistMetalId } from "./categoryMetalSelection.js";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const initialForm = (record) => ({
  name: record?.name ?? "",
  parentId: record?.parentId ?? "",
  metalId: record?.metalId ?? "",
  shortDescription: record?.shortDescription ?? "",
  description: record?.description ?? "",
  sortOrder: record?.sortOrder ?? 0,
  metaTitle: record?.metaTitle ?? "",
  metaDescription: record?.metaDescription ?? "",
  active: record?.status !== "INACTIVE",
});

const getDefaultMetalId = (record, metals) => {
  if (record?.metalId) return String(record.metalId);
  return getPersistedMetalId(metals);
};

export function CategoryFormModal({ open, record, categories, metals = [], onClose, onSubmit }) {
  const inputRef = useRef(null);
  const [form, setForm] = useState(() => initialForm(record));
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const previewUrl = useMemo(
    () =>
      imageFile ? URL.createObjectURL(imageFile) : removeImage ? null : record?.image?.secureUrl,
    [imageFile, record?.image?.secureUrl, removeImage],
  );

  useEffect(() => {
    if (!open) return;
    setForm({ ...initialForm(record), metalId: getDefaultMetalId(record, metals) });
    setImageFile(null);
    setRemoveImage(false);
    setDragging(false);
    setError(null);
  }, [metals, open, record]);

  useEffect(
    () => () => {
      if (imageFile && previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [imageFile, previewUrl],
  );

  const setValue = (name) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "metalId" ? { parentId: "" } : {}),
    }));
    if (name === "metalId") {
      persistMetalId(value);
    }
  };

  const parentOptions = useMemo(() => {
    if (!form.metalId) return categories;
    return categories.filter((category) => String(category.metalId) === String(form.metalId));
  }, [categories, form.metalId]);

  const selectImage = (file) => {
    if (!file) return;
    if (!acceptedImageTypes.has(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Category image cannot exceed 10 MB.");
      return;
    }
    setError(null);
    setImageFile(file);
    setRemoveImage(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!form.metalId) {
        setError("Select a metal before saving this category.");
        return;
      }

      const payload = {
        name: form.name.trim(),
        parentId: form.parentId ? Number(form.parentId) : null,
        metalId: form.metalId ? Number(form.metalId) : null,
        shortDescription: form.shortDescription.trim() || null,
        description: form.description.trim() || null,
        sortOrder: Number(form.sortOrder || 0),
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        ...(record ? { status: form.active ? "ACTIVE" : "INACTIVE" } : {}),
      };

      if (imageFile) {
        const uploaded = await mediaService.upload([imageFile], {
          folder: "categories",
          ownerType: "CATEGORY",
          ownerId: record?.id ?? null,
        });
        const image = uploaded.data?.[0];
        if (!image?.id) throw new Error("Category image upload did not return a media record.");
        payload.mediaId = Number(image.id);
      } else if (removeImage) {
        payload.mediaId = null;
      }

      await onSubmit(payload);
      onClose();
    } catch (submitError) {
      setError(apiErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      description={
        record
          ? "Update category details, image, hierarchy, and availability."
          : "The category starts active. Its unique slug is generated automatically."
      }
      open={open}
      size="lg"
      title={`${record ? "Edit" : "Add"} Category`}
      onClose={onClose}
    >
      <form className="resource-form category-form" onSubmit={submit}>
        <div className="resource-form__grid">
          <label className="resource-field">
            <span>
              Name <em>*</em>
            </span>
            <input required maxLength="150" value={form.name} onChange={setValue("name")} />
          </label>

          <label className="resource-field">
            <span>
              Metal <em>*</em>
            </span>
            <select required value={form.metalId} onChange={setValue("metalId")}>
              <option value="">
                {metals.length ? "Select metal" : "Create an active metal first"}
              </option>
              {metals.map((metal) => (
                <option key={metal.id} value={metal.id}>
                  {metal.name}
                </option>
              ))}
            </select>
          </label>

          <label className="resource-field">
            <span>Parent category</span>
            <select value={form.parentId} onChange={setValue("parentId")}>
              <option value="">Root category</option>
              {parentOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.path}
                </option>
              ))}
            </select>
          </label>

          <label className="resource-field resource-field--full">
            <span>Short description</span>
            <textarea
              maxLength="500"
              rows="2"
              value={form.shortDescription}
              onChange={setValue("shortDescription")}
            />
          </label>

          <label className="resource-field resource-field--full">
            <span>Description</span>
            <textarea rows="4" value={form.description} onChange={setValue("description")} />
          </label>

          <div className="resource-field resource-field--full">
            <span>Category image</span>
            <div className="category-image-editor">
              <article className={`category-image-preview ${previewUrl ? "has-image" : ""}`}>
                {previewUrl ? (
                  <img alt="Category preview" src={previewUrl} />
                ) : (
                  <span className="category-image-preview__default">
                    <ImageIcon size={32} />
                    <small>Default image</small>
                  </span>
                )}
                <span className="category-image-preview__label">
                  {imageFile ? "New image" : previewUrl ? "Current image" : "No image"}
                </span>
                {previewUrl && (
                  <button
                    aria-label="Remove category image"
                    className="category-image-preview__remove"
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setRemoveImage(true);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </article>

              <button
                className={`category-image-upload ${dragging ? "is-dragging" : ""}`}
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  selectImage(event.dataTransfer.files?.[0]);
                }}
              >
                <span>
                  <Plus size={25} />
                </span>
                <strong>{previewUrl ? "Replace image" : "Upload image"}</strong>
                <small>Choose or drop</small>
              </button>
              <input
                ref={inputRef}
                accept="image/jpeg,image/png,image/webp"
                hidden
                type="file"
                onChange={(event) => selectImage(event.target.files?.[0])}
              />
            </div>
            <small className="category-image-help">JPG, PNG, or WebP · maximum 10 MB</small>
          </div>

          <label className="resource-field">
            <span>Sort order</span>
            <input min="0" type="number" value={form.sortOrder} onChange={setValue("sortOrder")} />
          </label>

          {record && (
            <div className="category-status-toggle">
              <span>
                <strong>Category availability</strong>
                <small>Inactive categories remain saved but cannot be selected for products.</small>
              </span>
              <StatusToggle
                checked={form.active}
                onChange={(active) => setForm((current) => ({ ...current, active }))}
              />
            </div>
          )}

          <label className="resource-field resource-field--full">
            <span>SEO meta title</span>
            <input maxLength="180" value={form.metaTitle} onChange={setValue("metaTitle")} />
          </label>

          <label className="resource-field resource-field--full">
            <span>SEO meta description</span>
            <textarea
              rows="3"
              value={form.metaDescription}
              onChange={setValue("metaDescription")}
            />
          </label>
        </div>

        {error && <FormAlert>{error}</FormAlert>}

        <footer className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} type="submit">
            {record ? "Update Category" : "Create Category"}
          </Button>
        </footer>
      </form>
    </Modal>
  );
}
