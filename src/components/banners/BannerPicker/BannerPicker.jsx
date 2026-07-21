import { Check, ImageOff, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "../../common/Modal.jsx";
import { Button } from "../../common/Button.jsx";
import { ImageUploadField } from "../../forms/ImageUploadField/ImageUploadField.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { bannerPlaceholderService, bannerService } from "../../../services/resourceServices.js";
import "./BannerPicker.scss";

const emptyDraft = () => ({
  title: "",
  linkUrl: "",
  imageId: null,
  imagePreviewUrl: null,
  mobileImageId: null,
  mobileImagePreviewUrl: null,
  placementId: "",
});

// Metal-scoped banner multi-select used by Homepage Management's "Banners"
// section — pick a metal, browse that metal's (plus All-Metals) banners, or
// create a brand-new banner without leaving this picker (mirrors MediaPicker's
// "browse or upload" pattern, just for whole banners instead of raw images).
export function BannerPicker({ open, onClose, onConfirm, metalId, initialSelectedBanners = [] }) {
  const [search, setSearch] = useState("");
  const [banners, setBanners] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMap, setSelectedMap] = useState(() => new Map());
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedMap(new Map(initialSelectedBanners.map((banner) => [String(banner.id), banner])));
    setSearch("");
    setCreating(false);
    setDraft(emptyDraft());
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    bannerPlaceholderService
      .list({ status: "ACTIVE" })
      .then((response) => {
        const rows = response.data ?? [];
        setPlacements(rows);
        setDraft((current) => ({ ...current, placementId: current.placementId || rows[0]?.id || "" }));
      })
      .catch(() => setPlacements([]));
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    setLoading(true);
    const timer = setTimeout(() => {
      bannerService
        .list({ metalId: metalId || undefined, search: search || undefined, pageSize: 60 })
        .then((response) => setBanners(response.data ?? []))
        .catch(() => setBanners([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [open, metalId, search]);

  if (!open) return null;

  const toggle = (banner) => {
    setSelectedMap((current) => {
      const next = new Map(current);
      const key = String(banner.id);
      if (next.has(key)) next.delete(key);
      else next.set(key, banner);
      return next;
    });
  };

  const confirm = () => {
    onConfirm(Array.from(selectedMap.values()));
    onClose();
  };

  const createBanner = async () => {
    setError("");
    if (!draft.title.trim()) return setError("Title is required.");
    if (!draft.imageId) return setError("Banner image is required.");
    if (!draft.placementId) return setError("Placement is required.");

    setSaving(true);
    try {
      const response = await bannerService.create({
        title: draft.title.trim(),
        linkUrl: draft.linkUrl.trim() || null,
        imageId: draft.imageId,
        mobileImageId: draft.mobileImageId,
        placementId: Number(draft.placementId),
        metalId: metalId ? Number(metalId) : null,
      });
      const created = response.data;
      setBanners((current) => [created, ...current]);
      setSelectedMap((current) => new Map(current).set(String(created.id), created));
      setCreating(false);
      setDraft((current) => ({ ...emptyDraft(), placementId: current.placementId }));
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Add Banners" onClose={onClose} size="lg">
      <div className="banner-picker">
        {!metalId && (
          <p className="banner-picker__hint">
            Pick a metal above first to see banners from that metal.
          </p>
        )}

        <div className="banner-picker__toolbar">
          <div className="banner-picker__search">
            <Search size={15} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search banners by title"
              disabled={!metalId || creating}
            />
          </div>
          <Button
            type="button"
            variant={creating ? "secondary" : "primary"}
            size="sm"
            icon={creating ? X : Plus}
            onClick={() => setCreating((value) => !value)}
            disabled={!metalId}
          >
            {creating ? "Cancel New Banner" : "New Banner"}
          </Button>
        </div>

        {error && <p className="banner-picker__error">{error}</p>}

        {creating ? (
          <div className="banner-picker__create">
            <label>
              <span>Title</span>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="e.g. Diwali Gold Offer"
              />
            </label>

            <label>
              <span>Placement</span>
              <select
                value={draft.placementId}
                onChange={(event) => setDraft((current) => ({ ...current, placementId: event.target.value }))}
              >
                <option value="">Select placement</option>
                {placements.map((placement) => (
                  <option key={placement.id} value={placement.id}>
                    {placement.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Link URL (optional)</span>
              <input
                value={draft.linkUrl}
                onChange={(event) => setDraft((current) => ({ ...current, linkUrl: event.target.value }))}
                placeholder="/products?category=nathni"
              />
            </label>

            <div className="banner-picker__create-images">
              <div>
                <span>Banner image (desktop)</span>
                <ImageUploadField
                  previewUrl={draft.imagePreviewUrl}
                  folder="banners"
                  onSelect={(asset) =>
                    setDraft((current) => ({ ...current, imageId: asset.id, imagePreviewUrl: asset.secureUrl }))
                  }
                />
              </div>
              <div>
                <span>Banner image (mobile, optional)</span>
                <ImageUploadField
                  previewUrl={draft.mobileImagePreviewUrl}
                  folder="banners"
                  onSelect={(asset) =>
                    setDraft((current) => ({
                      ...current,
                      mobileImageId: asset.id,
                      mobileImagePreviewUrl: asset.secureUrl,
                    }))
                  }
                  onRemove={() =>
                    setDraft((current) => ({ ...current, mobileImageId: null, mobileImagePreviewUrl: null }))
                  }
                />
              </div>
            </div>

            <Button type="button" size="sm" loading={saving} onClick={createBanner}>
              Create &amp; Select
            </Button>
          </div>
        ) : (
          <div className="banner-picker__grid">
            {loading ? (
              <div className="banner-picker__empty">Loading…</div>
            ) : !metalId ? (
              <div className="banner-picker__empty">Select a metal to browse banners.</div>
            ) : banners.length ? (
              banners.map((banner) => {
                const checked = selectedMap.has(String(banner.id));
                return (
                  <button
                    type="button"
                    key={banner.id}
                    className={checked ? "banner-picker__card is-selected" : "banner-picker__card"}
                    onClick={() => toggle(banner)}
                  >
                    <span className="banner-picker__thumb">
                      {banner.image?.secureUrl ? (
                        <img src={banner.image.secureUrl} alt="" />
                      ) : (
                        <ImageOff size={20} />
                      )}
                      <span className="banner-picker__checkbox">{checked ? <Check size={12} /> : null}</span>
                    </span>
                    <span className="banner-picker__name">{banner.title}</span>
                  </button>
                );
              })
            ) : (
              <div className="banner-picker__empty">
                No banners found for this metal. Use &quot;New Banner&quot; above to create one.
              </div>
            )}
          </div>
        )}

        <footer className="banner-picker__footer">
          <span>{selectedMap.size ? `${selectedMap.size} selected` : "Nothing selected"}</span>
          <div>
            <button type="button" className="banner-picker__cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="banner-picker__confirm" onClick={confirm}>
              Use Selected
            </button>
          </div>
        </footer>
      </div>
    </Modal>
  );
}
