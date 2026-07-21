import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/common/Button.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { Modal } from "../../../components/common/Modal.jsx";
import { StatusToggle } from "../../../components/common/StatusToggle.jsx";
import { ImageUploadField } from "../../../components/forms/ImageUploadField/ImageUploadField.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { getPersistedMetalId, persistMetalId } from "./categoryMetalSelection.js";

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
  featuredOnHome: record?.featuredOnHome ?? false,
  homeSortOrder: record?.homeSortOrder ?? 0,
});

const getDefaultMetalId = (record, metals) => {
  if (record?.metalId) return String(record.metalId);
  return getPersistedMetalId(metals);
};

export function CategoryFormModal({ open, record, categories, metals = [], onClose, onSubmit }) {
  const [form, setForm] = useState(() => initialForm(record));
  const [imageMediaId, setImageMediaId] = useState(record?.image?.id ?? null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(record?.image?.secureUrl ?? null);
  const [imageTouched, setImageTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm({ ...initialForm(record), metalId: getDefaultMetalId(record, metals) });
    setImageMediaId(record?.image?.id ?? null);
    setImagePreviewUrl(record?.image?.secureUrl ?? null);
    setImageTouched(false);
    setError(null);
  }, [metals, open, record]);

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
        featuredOnHome: form.featuredOnHome,
        homeSortOrder: Number(form.homeSortOrder || 0),
        ...(record ? { status: form.active ? "ACTIVE" : "INACTIVE" } : {}),
        ...(imageTouched ? { mediaId: imageMediaId } : {}),
      };

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
            <ImageUploadField
              label="Category image"
              previewUrl={imagePreviewUrl}
              folder="categories"
              onSelect={(asset) => {
                setImageMediaId(Number(asset.id));
                setImagePreviewUrl(asset.secureUrl);
                setImageTouched(true);
              }}
              onRemove={() => {
                setImageMediaId(null);
                setImagePreviewUrl(null);
                setImageTouched(true);
              }}
            />
          </div>

          <label className="resource-field">
            <span>Sort order</span>
            <input min="0" type="number" value={form.sortOrder} onChange={setValue("sortOrder")} />
          </label>

          <div className="category-status-toggle">
            <span>
              <strong>Feature in &quot;Shop by Category&quot;</strong>
              <small>
                Shows this category in the curated homepage strip for its metal. Categories with
                no metal appear on every metal tab.
              </small>
            </span>
            <StatusToggle
              checked={form.featuredOnHome}
              activeLabel="Featured"
              inactiveLabel="Hidden"
              onChange={(featuredOnHome) => setForm((current) => ({ ...current, featuredOnHome }))}
            />
          </div>

          {form.featuredOnHome && (
            <label className="resource-field">
              <span>Homepage position</span>
              <input
                min="0"
                type="number"
                value={form.homeSortOrder}
                onChange={setValue("homeSortOrder")}
              />
            </label>
          )}

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
