import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Monitor,
  Plus,
  RefreshCw,
  Save,
  Smartphone,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../../components/common/Badge.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Card } from "../../../components/common/Card.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { Modal } from "../../../components/common/Modal.jsx";
import { StatusToggle } from "../../../components/common/StatusToggle.jsx";
import { BannerPicker } from "../../../components/banners/BannerPicker/BannerPicker.jsx";
import { CategoryPicker } from "../../../components/categories/CategoryPicker/CategoryPicker.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { MediaPicker } from "../../../components/media/MediaPicker/MediaPicker.jsx";
import { env } from "../../../config/env.js";
import { apiErrorMessage } from "../../../services/apiClient.js";
import {
  bannerService,
  categoryService,
  collectionService,
  homepageService,
  metalService,
} from "../../../services/resourceServices.js";
import { SECTION_TYPES, sectionTypeMeta, sectionTypesForAudience } from "../data/sectionTypes.js";
import "./HomepageManagementPage.scss";

const AUDIENCES = [
  { value: "B2B", label: "B2B (Shopkeepers)" },
  { value: "B2C", label: "B2C (Customers)" },
];

const statusTone = { ACTIVE: "success", INACTIVE: "neutral" };

// Picks which admin-created Collections (from Catalog → Collections) appear
// in this homepage's Collections section, and in what order — a checklist to
// add/remove plus up/down arrows to reorder, mirroring the section reorder
// controls elsewhere on this page.
function CollectionsOrderField({ value, allCollections, onChange }) {
  const selectedIds = (value ?? []).map(String);
  const selected = selectedIds
    .map((id) => allCollections.find((collection) => String(collection.id) === id))
    .filter(Boolean);
  const available = allCollections.filter(
    (collection) => !selectedIds.includes(String(collection.id)),
  );

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= selectedIds.length) return;
    const next = selectedIds.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="hp-collections-field">
      <ul className="hp-collections-field__selected">
        {selected.map((collection, index) => (
          <li key={collection.id}>
            <span>{collection.name}</span>
            <div className="hp-collections-field__actions">
              <button type="button" title="Move up" onClick={() => move(index, -1)}>
                <ChevronUp size={13} />
              </button>
              <button type="button" title="Move down" onClick={() => move(index, 1)}>
                <ChevronDown size={13} />
              </button>
              <button
                type="button"
                className="is-danger"
                title="Remove"
                onClick={() => onChange(selectedIds.filter((id) => id !== String(collection.id)))}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </li>
        ))}
        {!selected.length && <li className="hp-collections-field__empty">No collections added yet.</li>}
      </ul>

      {available.length ? (
        <select
          value=""
          onChange={(event) => {
            if (event.target.value) onChange([...selectedIds, event.target.value]);
          }}
        >
          <option value="">Add a collection…</option>
          {available.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}

// Picks which categories appear in "Shop by Category", across as many metals
// as you like from one place — pick a metal, browse that metal's full
// category list in a checklist, and the picks accumulate here (with up/down
// reorder), instead of hunting through hundreds of individual category edit
// forms toggling one at a time.
function HomeCategoriesField({ value, allCategories, metals, onChange }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedIds = (value ?? []).map(String);
  const selected = selectedIds
    .map((id) => allCategories.find((category) => String(category.id) === id))
    .filter(Boolean);

  const move = (id, delta) => {
    const index = selectedIds.indexOf(id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= selectedIds.length) return;
    const next = selectedIds.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (id) => onChange(selectedIds.filter((existing) => existing !== id));

  // The picker owns its own metal switcher and is pre-seeded with every
  // previously-picked category (across every metal), so its returned
  // selection is already the complete, authoritative list — no merge math
  // needed here (unlike HomeBannersField, whose BannerPicker doesn't yet
  // carry its own metal switcher).
  const handleConfirm = (pickedCategories) => {
    onChange(pickedCategories.map((category) => String(category.id)));
  };

  return (
    <div className="hp-collections-field">
      <ul className="hp-collections-field__selected">
        {selected.map((category) => (
          <li key={category.id}>
            <span>
              {category.name} <small>({category.metal?.name ?? "All Metals"})</small>
            </span>
            <div className="hp-collections-field__actions">
              <button type="button" title="Move up" onClick={() => move(String(category.id), -1)}>
                <ChevronUp size={13} />
              </button>
              <button type="button" title="Move down" onClick={() => move(String(category.id), 1)}>
                <ChevronDown size={13} />
              </button>
              <button
                type="button"
                className="is-danger"
                title="Remove"
                onClick={() => remove(String(category.id))}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </li>
        ))}
        {!selected.length && <li className="hp-collections-field__empty">No categories added yet.</li>}
      </ul>

      <div className="hp-categories-field__browse">
        <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={() => setPickerOpen(true)}>
          Browse categories
        </Button>
      </div>

      <CategoryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        metals={metals}
        initialSelectedCategories={selected}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

// Picks which banners rotate in the "Promotional Banners" carousel, across
// as many metals as you like from one place — pick a metal, browse that
// metal's banners in a checklist, and the picks accumulate here (with
// up/down reorder). A banner with no metal set is eligible on every tab
// automatically, without needing to be added here per metal.
function HomeBannersField({ value, allBanners, metals, onChange }) {
  const [browseMetalOverride, setBrowseMetalOverride] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  // Derived, not stateful: `metals` loads asynchronously after this field can
  // already be mounted, so falling back to metals[0] here (rather than baking
  // it into useState's initializer) means the browse button stops being
  // permanently stuck disabled once metals arrives.
  const browseMetalId = browseMetalOverride || (metals[0] ? String(metals[0].id) : "");

  const selectedIds = (value ?? []).map(String);
  const selected = selectedIds
    .map((id) => allBanners.find((banner) => String(banner.id) === id))
    .filter(Boolean);

  const move = (id, delta) => {
    const index = selectedIds.indexOf(id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= selectedIds.length) return;
    const next = selectedIds.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (id) => onChange(selectedIds.filter((existing) => existing !== id));

  // Browsing a metal shows that metal's banners *and* any "All Metals" ones
  // together (they're eligible everywhere, so hiding them per-metal would
  // make them impossible to find/manage) — so the merge has to treat both as
  // "visible in this session" when reconciling checked/unchecked state.
  const visibleInBrowse = (banner) => {
    if (!banner) return false;
    return banner.metalId == null || String(banner.metalId) === String(browseMetalId);
  };

  const handleConfirm = (pickedBanners) => {
    const withoutBrowsedMetal = selectedIds.filter((id) => {
      const banner = allBanners.find((item) => String(item.id) === id);
      return !visibleInBrowse(banner);
    });
    onChange([...withoutBrowsedMetal, ...pickedBanners.map((banner) => String(banner.id))]);
  };

  return (
    <div className="hp-collections-field">
      <ul className="hp-collections-field__selected">
        {selected.map((banner) => (
          <li key={banner.id}>
            <span>
              {banner.title} <small>({banner.metal?.name ?? "All Metals"})</small>
            </span>
            <div className="hp-collections-field__actions">
              <button type="button" title="Move up" onClick={() => move(String(banner.id), -1)}>
                <ChevronUp size={13} />
              </button>
              <button type="button" title="Move down" onClick={() => move(String(banner.id), 1)}>
                <ChevronDown size={13} />
              </button>
              <button
                type="button"
                className="is-danger"
                title="Remove"
                onClick={() => remove(String(banner.id))}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </li>
        ))}
        {!selected.length && <li className="hp-collections-field__empty">No banners added yet.</li>}
      </ul>

      <div className="hp-categories-field__browse">
        <select value={browseMetalId} onChange={(event) => setBrowseMetalOverride(event.target.value)}>
          {metals.map((metal) => (
            <option key={metal.id} value={metal.id}>
              {metal.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={() => setPickerOpen(true)}
          disabled={!browseMetalId}
        >
          Browse banners
        </Button>
      </div>

      <BannerPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        metalId={browseMetalId}
        initialSelectedBanners={selected.filter(visibleInBrowse)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export function HomepageManagementPage() {
  const [audience, setAudience] = useState("B2B");
  const [metals, setMetals] = useState([]);
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [metalFilter, setMetalFilter] = useState("");
  const [config, setConfig] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [sectionDraft, setSectionDraft] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [mediaField, setMediaField] = useState(null);
  const [previewDevice, setPreviewDevice] = useState("web");
  const [previewReloadKey, setPreviewReloadKey] = useState(0);

  const selectedSection = sections.find((section) => String(section.id) === String(selectedSectionId));

  // "Shop by Category" is a mandatory storefront block — every homepage must
  // keep at least one. It can still be hidden via the Visibility toggle.
  const isSoleQuickCategories = (section) =>
    section?.sectionType === "QUICK_CATEGORIES" &&
    sections.filter((row) => row.sectionType === "QUICK_CATEGORIES").length <= 1;

  const applyConfig = useCallback((payload) => {
    const rows = (payload?.sections ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
    setConfig(payload ?? null);
    setSections(rows);
    setSelectedSectionId((current) => {
      if (current && rows.some((row) => String(row.id) === String(current))) return current;
      return rows[0]?.id ?? null;
    });
  }, []);

  const loadForFilters = useCallback(() => {
    setLoading(true);
    setError(null);
    homepageService
      .list({ audience })
      .then(async (response) => {
        const rows = response.data ?? [];
        const wantedMetal = metalFilter === "" ? null : String(metalFilter);
        const match = rows.find((row) => {
          const rowMetal = row.metalId === null || row.metalId === undefined ? null : String(row.metalId);
          return rowMetal === wantedMetal;
        });
        if (!match) {
          applyConfig(null);
          return;
        }
        const detail = await homepageService.get(match.id);
        applyConfig(detail.data);
      })
      .catch((requestError) => setError(apiErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, [audience, metalFilter, applyConfig]);

  useEffect(() => {
    // Background prefetches for the section-settings pickers — each already
    // degrades gracefully to an empty list on failure, so a failure here
    // isn't worth interrupting the admin with an error toast over.
    const silent = { notification: false };
    metalService
      .list({ isActive: true, limit: 50 }, silent)
      .then((response) => setMetals(response.data?.rows ?? response.data ?? []))
      .catch(() => setMetals([]));
    collectionService
      .list({ pageSize: 100, status: "ACTIVE" }, silent)
      .then((response) => setCollections(response.data ?? []))
      .catch(() => setCollections([]));
    categoryService
      .list({ pageSize: 100, status: "ACTIVE" }, silent)
      .then((response) => setCategories(response.data?.rows ?? response.data ?? []))
      .catch(() => setCategories([]));
    bannerService
      .list({ pageSize: 100, status: "ACTIVE" }, silent)
      .then((response) => setBanners(response.data ?? []))
      .catch(() => setBanners([]));
  }, []);

  useEffect(loadForFilters, [loadForFilters]);

  useEffect(() => {
    if (!selectedSection) {
      setSectionDraft(null);
      return;
    }
    setSectionDraft({
      title: selectedSection.title ?? "",
      subtitle: selectedSection.subtitle ?? "",
      config: { ...(selectedSection.configJson ?? {}) },
      advanced: JSON.stringify(selectedSection.configJson ?? {}, null, 2),
      isActive: selectedSection.isActive,
    });
  }, [selectedSectionId, selectedSection]);

  const flashNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 3500);
  };

  const refresh = async () => {
    if (!config) return;
    const detail = await homepageService.get(config.id);
    applyConfig(detail.data);
  };

  const createConfig = async () => {
    setSaving(true);
    setError(null);
    try {
      const metal = metals.find((row) => String(row.id) === String(metalFilter));
      await homepageService.create({
        audienceType: audience,
        metalId: metalFilter === "" ? null : Number(metalFilter),
        title: `${audience} Homepage${metal ? ` — ${metal.name}` : ""}`,
      });
      flashNotice("Homepage created. Add sections to get started.");
      loadForFilters();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const persistOrder = async (nextSections) => {
    if (!config) return;
    try {
      await homepageService.reorderSections(
        config.id,
        nextSections.map((section, index) => ({ id: Number(section.id), sortOrder: index })),
      );
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  };

  const moveSection = (index, delta) => {
    const next = sections.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    persistOrder(next);
  };

  const onDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const next = sections.slice();
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setSections(next);
    persistOrder(next);
    setDragIndex(null);
  };

  const saveSection = async () => {
    if (!config || !selectedSection || !sectionDraft) return;
    setSaving(true);
    setError(null);
    try {
      let parsedConfig = sectionDraft.config;
      if (sectionDraft.advancedDirty) {
        parsedConfig = JSON.parse(sectionDraft.advanced);
      }
      await homepageService.updateSection(config.id, selectedSection.id, {
        title: sectionDraft.title === "" ? null : sectionDraft.title,
        subtitle: sectionDraft.subtitle === "" ? null : sectionDraft.subtitle,
        config: parsedConfig,
        isActive: sectionDraft.isActive,
      });
      await refresh();
      flashNotice("Section saved.");
    } catch (requestError) {
      setError(
        requestError instanceof SyntaxError
          ? "Advanced JSON is not valid JSON."
          : apiErrorMessage(requestError),
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleSectionActive = async (section, next) => {
    await homepageService.updateSection(config.id, section.id, { isActive: next });
    await refresh();
  };

  const addSection = async (sectionType) => {
    setAddOpen(false);
    setSaving(true);
    setError(null);
    try {
      const created = await homepageService.addSection(config.id, { sectionType });
      await refresh();
      setSelectedSectionId(created.data?.id ?? null);
      flashNotice("Section added.");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const duplicateSection = async (section) => {
    setSaving(true);
    try {
      await homepageService.duplicateSection(config.id, section.id);
      await refresh();
      flashNotice("Section duplicated.");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const removeSection = async () => {
    if (!removeTarget) return;
    setSaving(true);
    try {
      await homepageService.removeSection(config.id, removeTarget.id);
      setRemoveTarget(null);
      await refresh();
      flashNotice("Section removed.");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const setDraftField = (field) => (event) =>
    setSectionDraft((current) => ({ ...current, [field]: event.target.value }));

  const setDraftConfigField = (name, value) =>
    setSectionDraft((current) => {
      const nextConfig = { ...current.config, [name]: value };
      return {
        ...current,
        config: nextConfig,
        advanced: JSON.stringify(nextConfig, null, 2),
        advancedDirty: false,
      };
    });

  const typeMeta = selectedSection ? sectionTypeMeta(selectedSection.sectionType) : null;

  return (
    <div className="page-stack homepage-management">
      <PageHeader
        eyebrow="CMS"
        title="Homepage Management"
        description="Manage homepage sections for different audiences and metals — changes go live immediately"
      />

      {error && <FormAlert>{error}</FormAlert>}
      {notice && <FormAlert tone="success">{notice}</FormAlert>}

      <FormAlert tone="info">
        Looking for the rotating hero banner? That&apos;s managed separately under{" "}
        <Link to="/cms/banners">CMS → Banner Management</Link>. The sections below control page
        layout only (search bar, categories, product rows, etc.) — they don&apos;t include banner
        images.
      </FormAlert>

      {metalFilter !== "" && (
        <FormAlert tone="info">
          You&apos;re editing a homepage scoped to one metal. The live storefront currently only
          reads the <strong>All metals</strong> homepage — for a Collections section, switch back
          to All metals and rely on each collection&apos;s own Metal field instead, since that
          already controls which tab it appears on.
        </FormAlert>
      )}

      <Card className="hp-filters" padded>
        <div className="hp-filters__group">
          <span className="hp-filters__label">Audience</span>
          <div className="hp-filters__tabs">
            {AUDIENCES.map((item) => (
              <button
                key={item.value}
                type="button"
                className={audience === item.value ? "is-active" : ""}
                onClick={() => setAudience(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hp-filters__group">
          <span className="hp-filters__label">Metal</span>
          <select value={metalFilter} onChange={(event) => setMetalFilter(event.target.value)}>
            <option value="">All metals</option>
            {metals.map((metal) => (
              <option key={metal.id} value={metal.id}>
                {metal.name}
              </option>
            ))}
          </select>
        </div>

        {config && (
          <div className="hp-filters__group hp-filters__status">
            <span className="hp-filters__label">Status</span>
            <Badge tone={statusTone[config.status] ?? "neutral"} dot>
              {config.status}
            </Badge>
          </div>
        )}
      </Card>

      {loading ? (
        <Card padded>
          <div className="hp-empty">Loading homepage…</div>
        </Card>
      ) : !config ? (
        <Card padded>
          <div className="hp-empty">
            <p>
              No homepage configured yet for <strong>{audience}</strong>
              {metalFilter !== "" ? " with this metal" : ""}.
            </p>
            <Button icon={Plus} loading={saving} onClick={createConfig}>
              Create homepage
            </Button>
          </div>
        </Card>
      ) : (
        <div className="hp-grid">
          <Card className="hp-sections" padded>
            <div className="hp-sections__head">
              <div>
                <h3>Homepage Sections</h3>
                <p>Drag or use arrows to reorder sections</p>
              </div>
              <Button variant="secondary" size="sm" icon={Plus} onClick={() => setAddOpen(true)}>
                Add Section
              </Button>
            </div>

            <div className="hp-sections__list">
              {sections.map((section, index) => {
                const meta = sectionTypeMeta(section.sectionType);
                const Icon = meta.icon;
                const selected = String(section.id) === String(selectedSectionId);
                return (
                  <div
                    key={section.id}
                    className={`hp-section-row${selected ? " is-selected" : ""}${
                      section.isActive === false ? " is-disabled" : ""
                    }`}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => onDrop(index)}
                    onClick={() => setSelectedSectionId(section.id)}
                  >
                    <span className="hp-section-row__grip">
                      <GripVertical size={15} />
                    </span>
                    <span className="hp-section-row__index">{index + 1}</span>
                    <span className="hp-section-row__icon">
                      <Icon size={16} />
                    </span>
                    <span className="hp-section-row__copy">
                      <strong>{meta.label}</strong>
                      <small>{section.title ?? meta.description}</small>
                    </span>
                    <span className="hp-section-row__badge">
                      <Badge tone={section.isActive === false ? "neutral" : "success"}>
                        {section.isActive === false ? "Hidden" : "Active"}
                      </Badge>
                    </span>
                    <span className="hp-section-row__actions" onClick={(event) => event.stopPropagation()}>
                      <button type="button" title="Move up" onClick={() => moveSection(index, -1)}>
                        <ChevronUp size={14} />
                      </button>
                      <button type="button" title="Move down" onClick={() => moveSection(index, 1)}>
                        <ChevronDown size={14} />
                      </button>
                      <button type="button" title="Duplicate" onClick={() => duplicateSection(section)}>
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        title={
                          isSoleQuickCategories(section)
                            ? "Shop by Category is required — hide it with the toggle instead"
                            : "Remove"
                        }
                        className="is-danger"
                        disabled={isSoleQuickCategories(section)}
                        onClick={() => setRemoveTarget(section)}
                      >
                        <Trash2 size={14} />
                      </button>
                      <StatusToggle
                        compact
                        checked={section.isActive !== false}
                        activeLabel=""
                        inactiveLabel=""
                        onChange={(next) => toggleSectionActive(section, next)}
                      />
                    </span>
                  </div>
                );
              })}
              {sections.length === 0 && <div className="hp-empty">No sections yet. Add one to begin.</div>}
            </div>
          </Card>

          <Card className="hp-settings" padded>
            <h3>Section Settings</h3>
            {!selectedSection || !sectionDraft ? (
              <div className="hp-empty">Select a section to configure it.</div>
            ) : (
              <div className="hp-settings__form">
                <p className="hp-settings__type">
                  {typeMeta.label}
                  <small>{typeMeta.description}</small>
                </p>

                <label>
                  <span>Section Title</span>
                  <input type="text" value={sectionDraft.title} onChange={setDraftField("title")} />
                </label>

                <label>
                  <span>Subtitle</span>
                  <input type="text" value={sectionDraft.subtitle} onChange={setDraftField("subtitle")} />
                </label>

                {typeMeta.fields.map((field) => (
                  <label key={field.name}>
                    <span>{field.label}</span>
                    {field.input === "toggle" ? (
                      <StatusToggle
                        checked={Boolean(sectionDraft.config[field.name])}
                        activeLabel="On"
                        inactiveLabel="Off"
                        onChange={(next) => setDraftConfigField(field.name, next)}
                      />
                    ) : field.input === "media" ? (
                      <div className="hp-media-field">
                        {sectionDraft.config[field.name] ? (
                          <img src={sectionDraft.config[field.name]} alt="" />
                        ) : (
                          <div className="hp-media-field__empty">No banner selected</div>
                        )}
                        <div className="hp-media-field__actions">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={UploadCloud}
                            onClick={() => setMediaField(field.name)}
                          >
                            Upload / Select
                          </Button>
                          {sectionDraft.config[field.name] ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDraftConfigField(field.name, "")}
                            >
                              Clear
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ) : field.input === "collections" ? (
                      <CollectionsOrderField
                        value={sectionDraft.config[field.name]}
                        allCollections={collections}
                        onChange={(nextIds) => setDraftConfigField(field.name, nextIds)}
                      />
                    ) : field.input === "categoriesByMetal" ? (
                      <HomeCategoriesField
                        value={sectionDraft.config[field.name]}
                        allCategories={categories}
                        metals={metals}
                        onChange={(nextIds) => setDraftConfigField(field.name, nextIds)}
                      />
                    ) : field.input === "bannersByMetal" ? (
                      <HomeBannersField
                        value={sectionDraft.config[field.name]}
                        allBanners={banners}
                        metals={metals}
                        onChange={(nextIds) => setDraftConfigField(field.name, nextIds)}
                      />
                    ) : (
                      <input
                        type={field.input === "number" ? "number" : "text"}
                        placeholder={field.name === "ctaTarget" ? "/products?category=nathni" : ""}
                        value={sectionDraft.config[field.name] ?? ""}
                        onChange={(event) =>
                          setDraftConfigField(
                            field.name,
                            field.input === "number"
                              ? Number(event.target.value || 0)
                              : event.target.value,
                          )
                        }
                      />
                    )}
                  </label>
                ))}

                <label className="hp-settings__visibility">
                  <span>Visibility</span>
                  <StatusToggle
                    checked={sectionDraft.isActive !== false}
                    activeLabel="Show on homepage"
                    inactiveLabel="Hidden"
                    onChange={(next) => setSectionDraft((current) => ({ ...current, isActive: next }))}
                  />
                </label>

                <details className="hp-settings__advanced">
                  <summary>Advanced (JSON)</summary>
                  <textarea
                    rows={6}
                    value={sectionDraft.advanced}
                    onChange={(event) =>
                      setSectionDraft((current) => ({
                        ...current,
                        advanced: event.target.value,
                        advancedDirty: true,
                      }))
                    }
                  />
                </details>

                <div className="hp-settings__actions">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    disabled={isSoleQuickCategories(selectedSection)}
                    title={
                      isSoleQuickCategories(selectedSection)
                        ? "Shop by Category is required — hide it with the Visibility toggle instead"
                        : undefined
                    }
                    onClick={() => setRemoveTarget(selectedSection)}
                  >
                    Remove Section
                  </Button>
                  <Button size="sm" icon={Save} loading={saving} onClick={saveSection}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="hp-preview" padded>
            <div className="hp-preview__head">
              <h3>Live Preview</h3>
              <div className="hp-preview__tabs">
                <button
                  type="button"
                  className={previewDevice === "web" ? "is-active" : ""}
                  onClick={() => setPreviewDevice("web")}
                >
                  <Monitor size={14} /> Web
                </button>
                <button
                  type="button"
                  className={previewDevice === "mobile" ? "is-active" : ""}
                  onClick={() => setPreviewDevice("mobile")}
                >
                  <Smartphone size={14} /> Mobile
                </button>
              </div>
              <button
                type="button"
                className="hp-preview__refresh"
                title="Reload preview"
                onClick={() => setPreviewReloadKey((key) => key + 1)}
              >
                <RefreshCw size={14} />
              </button>
            </div>
            <div className={`hp-preview__frame hp-preview__frame--${previewDevice}`}>
              <iframe key={previewReloadKey} src={env.storefrontUrl} title="ornacore-web live preview" />
            </div>
            <p className="hp-preview__hint">
              This is the real ornacore-web homepage, live. Section changes here save immediately —
              use Refresh above to reload the preview.
            </p>
          </Card>
        </div>
      )}

      <Modal open={addOpen} title="Add Section" description={`Sections available for ${audience}`} onClose={() => setAddOpen(false)}>
        <div className="hp-add-grid">
          {sectionTypesForAudience(audience).map((item) => {
            const Icon = item.icon ?? SECTION_TYPES.SEARCH_BAR.icon;
            return (
              <button key={item.type} type="button" className="hp-add-card" onClick={() => addSection(item.type)}>
                <Icon size={18} />
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </button>
            );
          })}
        </div>
      </Modal>

      <MediaPicker
        open={Boolean(mediaField)}
        folder="homepage-banners"
        title="Select Homepage Banner"
        onClose={() => setMediaField(null)}
        onSelect={(asset) => {
          if (!mediaField || !asset) return;
          setDraftConfigField(mediaField, asset.secureUrl);
          setMediaField(null);
        }}
      />

      <Modal
        open={Boolean(removeTarget)}
        title="Remove section?"
        description={removeTarget ? `"${sectionTypeMeta(removeTarget.sectionType).label}" will be removed from this homepage.` : ""}
        onClose={() => setRemoveTarget(null)}
      >
        <div className="hp-remove-actions">
          <Button variant="secondary" size="sm" onClick={() => setRemoveTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" icon={Trash2} loading={saving} onClick={removeSection}>
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}
