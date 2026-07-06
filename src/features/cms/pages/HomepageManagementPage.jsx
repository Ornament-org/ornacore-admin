import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "../../../components/common/Badge.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Card } from "../../../components/common/Card.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { Modal } from "../../../components/common/Modal.jsx";
import { StatusToggle } from "../../../components/common/StatusToggle.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { homepageService, metalService } from "../../../services/resourceServices.js";
import { SECTION_TYPES, sectionTypeMeta, sectionTypesForAudience } from "../data/sectionTypes.js";
import "./HomepageManagementPage.scss";

const AUDIENCES = [
  { value: "B2B", label: "B2B (Shopkeepers)" },
  { value: "B2C", label: "B2C (Customers)" },
];

const statusTone = { PUBLISHED: "success", DRAFT: "warning", ARCHIVED: "neutral" };

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function SectionPreviewBlock({ section }) {
  switch (section.sectionType) {
    case "SEARCH_BAR":
      return (
        <div className="hp-preview__search">
          {section.configJson?.placeholder ?? "Search..."}
        </div>
      );
    case "METAL_SWITCHER":
      return (
        <div className="hp-preview__metals">
          <span className="is-active">GOLD</span>
          <span>SILVER</span>
          <span>DIAMOND</span>
        </div>
      );
    case "RATE_BANNER":
      return (
        <div className="hp-preview__rate">
          <small>TODAY&apos;S GOLD RATE</small>
          <strong>₹ 9,820 /gm</strong>
          <em>▲ 24 (0.24%) from yesterday</em>
        </div>
      );
    case "HERO_BANNER":
    case "FESTIVAL_BANNER":
      return (
        <div className="hp-preview__hero">
          <span>{sectionTypeMeta(section.sectionType).label}</span>
        </div>
      );
    case "QUICK_CATEGORIES":
      return (
        <div className="hp-preview__section">
          <small>{section.title ?? "QUICK CATEGORIES"}</small>
          <div className="hp-preview__tiles">
            {[...Array(5)].map((_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>
      );
    case "TRENDING_PRODUCTS":
    case "POPULAR_PRODUCTS":
    case "RECENTLY_ADDED":
    case "RECOMMENDED_PRODUCTS":
      return (
        <div className="hp-preview__section">
          <small>{section.title ?? sectionTypeMeta(section.sectionType).label.toUpperCase()}</small>
          <div className="hp-preview__cards">
            {[...Array(3)].map((_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>
      );
    case "COLLECTIONS":
    case "OFFERS":
      return (
        <div className="hp-preview__section">
          <small>{section.title ?? sectionTypeMeta(section.sectionType).label.toUpperCase()}</small>
          <div className="hp-preview__wide" />
        </div>
      );
    case "TRUST_SECTION":
      return (
        <div className="hp-preview__trust">
          <span>BIS</span>
          <span>Secure</span>
          <span>B2B</span>
          <span>Support</span>
        </div>
      );
    case "SUPPORT_SECTION":
      return (
        <div className="hp-preview__support">
          <span>{section.title ?? "Need help finding something?"}</span>
          <em>Contact Support</em>
        </div>
      );
    default:
      return <div className="hp-preview__wide" />;
  }
}

export function HomepageManagementPage() {
  const [audience, setAudience] = useState("B2B");
  const [metals, setMetals] = useState([]);
  const [metalFilter, setMetalFilter] = useState("");
  const [config, setConfig] = useState(null);
  const [sections, setSections] = useState([]);
  const [versions, setVersions] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [sectionDraft, setSectionDraft] = useState(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const selectedSection = sections.find((section) => String(section.id) === String(selectedSectionId));

  const applyConfig = useCallback((payload) => {
    const rows = (payload?.sections ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
    setConfig(payload ?? null);
    setSections(rows);
    setOrderDirty(false);
    setSelectedSectionId((current) => {
      if (current && rows.some((row) => String(row.id) === String(current))) return current;
      return rows[0]?.id ?? null;
    });
  }, []);

  const loadVersions = useCallback((id) => {
    homepageService
      .versions(id)
      .then((response) => setVersions(response.data ?? []))
      .catch(() => setVersions([]));
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
          return rowMetal === wantedMetal && row.status !== "ARCHIVED";
        });
        if (!match) {
          applyConfig(null);
          setVersions([]);
          return;
        }
        const detail = await homepageService.get(match.id);
        applyConfig(detail.data);
        loadVersions(match.id);
      })
      .catch((requestError) => setError(apiErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, [audience, metalFilter, applyConfig, loadVersions]);

  useEffect(() => {
    metalService
      .list({ limit: 50 })
      .then((response) => setMetals(response.data?.rows ?? response.data ?? []))
      .catch(() => setMetals([]));
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
    loadVersions(config.id);
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
      flashNotice("Homepage created as draft. Add sections, then publish.");
      loadForFilters();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (index, delta) => {
    const next = sections.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    setOrderDirty(true);
  };

  const onDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const next = sections.slice();
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setSections(next);
    setOrderDirty(true);
    setDragIndex(null);
  };

  const flushOrder = async () => {
    if (!orderDirty || !config) return;
    await homepageService.reorderSections(
      config.id,
      sections.map((section, index) => ({ id: Number(section.id), sortOrder: index })),
    );
    setOrderDirty(false);
  };

  const saveDraft = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    try {
      await flushOrder();
      await refresh();
      flashNotice("Draft saved. Publish to make changes live.");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!config) return;
    setPublishing(true);
    setError(null);
    try {
      await flushOrder();
      await homepageService.publish(config.id);
      await refresh();
      flashNotice("Published. The app now serves this version.");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setPublishing(false);
    }
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

  const activePreviewSections = useMemo(
    () => sections.filter((section) => section.isActive !== false),
    [sections],
  );

  const typeMeta = selectedSection ? sectionTypeMeta(selectedSection.sectionType) : null;

  return (
    <div className="page-stack homepage-management">
      <PageHeader
        eyebrow="CMS"
        title="Homepage Management"
        description="Manage homepage sections for different audiences and metals"
        actions={
          <>
            <Button variant="secondary" size="sm" icon={Save} loading={saving} onClick={saveDraft} disabled={!config}>
              Save as Draft
            </Button>
            <Button size="sm" icon={UploadCloud} loading={publishing} onClick={publish} disabled={!config}>
              Publish Changes
            </Button>
          </>
        }
      />

      {error && <FormAlert>{error}</FormAlert>}
      {notice && <FormAlert tone="success">{notice}</FormAlert>}

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
            <span className="hp-filters__version">v{config.version}</span>
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
                        title="Remove"
                        className="is-danger"
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

            {orderDirty && <p className="hp-sections__dirty">Order changed — Save as Draft to persist.</p>}

            <div className="hp-history">
              <h4>Homepage History</h4>
              <table>
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Published by</th>
                    <th>Published on</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((version) => (
                    <tr key={version.id}>
                      <td>v{version.version}</td>
                      <td>
                        <Badge tone="success">{version.status}</Badge>
                      </td>
                      <td>{version.publishedBy?.staffProfile?.fullName ?? version.publishedBy?.email ?? "—"}</td>
                      <td>{formatDateTime(version.createdAt)}</td>
                    </tr>
                  ))}
                  {versions.length === 0 && (
                    <tr>
                      <td colSpan={4}>Not published yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
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
                    ) : (
                      <input
                        type={field.input === "number" ? "number" : "text"}
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
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => setRemoveTarget(selectedSection)}>
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
            <h3>
              Live Preview <small>({audience} {metalFilter === "" ? "" : `· ${metals.find((m) => String(m.id) === String(metalFilter))?.name ?? ""}`})</small>
            </h3>
            <div className="hp-preview__phone">
              <div className="hp-preview__notch" />
              <div className="hp-preview__screen">
                <div className="hp-preview__brand">ORNACORE</div>
                {activePreviewSections.map((section) => (
                  <SectionPreviewBlock key={section.id ?? section.sectionKey} section={section} />
                ))}
              </div>
            </div>
            <p className="hp-preview__hint">This is a structural preview. Changes reflect after saving.</p>
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
