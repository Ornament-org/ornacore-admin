import {
  Layers,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { attributeService } from "../../../services/resourceServices.js";
import {
  clearSelected,
  fetchAttributeById,
  fetchAttributes,
  invalidateAll,
  removeValueFromSelected,
  selectAttributeListStatus,
  selectAttributeRows,
  selectSelectedAttribute,
  selectSelectedStatus,
} from "../store/attributeSlice.js";
import "../Attributes.scss";

// ─── Tag input for bulk value entry ───────────────────────────────────────────

function TagInput({ tags, onChange }) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const addTag = () => {
    const val = draft.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setDraft("");
  };

  const removeTag = (i) => onChange(tags.filter((_, idx) => idx !== i));

  return (
    <div className="attr-tag-input" onClick={() => inputRef.current?.focus()}>
      {tags.map((t, i) => (
        <span key={i} className="attr-tag">
          {t}
          <button type="button" onClick={() => removeTag(i)}><X size={11} /></button>
        </span>
      ))}
      <input
        ref={inputRef}
        className="attr-tag-input__field"
        placeholder={tags.length === 0 ? "Type a value, press Enter or comma…" : "Add more…"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
          if (e.key === "Backspace" && !draft && tags.length) removeTag(tags.length - 1);
        }}
        onBlur={addTag}
      />
    </div>
  );
}

// ─── Attribute modal (create / edit) ──────────────────────────────────────────

function AttributeModal({ attr, onClose, onSaved }) {
  const isEdit = Boolean(attr?.id);
  const [name, setName] = useState(attr?.name ?? "");
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await attributeService.update(attr.id, { name: name.trim() });
      } else {
        await attributeService.create({
          name: name.trim(),
          values: tags.map((v, i) => ({ value: v, displayOrder: i })),
        });
      }
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="attr-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="attr-modal">
        <div className="attr-modal__header">
          <h3 className="attr-modal__title">{isEdit ? "Edit Attribute" : "New Attribute"}</h3>
          <button className="attr-modal__close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="attr-modal__body">
            <div className="attr-field">
              <label className="attr-field__label">Attribute Name</label>
              <input
                className="attr-field__input"
                placeholder="e.g. Purity, Size, Length"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <span className="attr-field__hint">
                Global attribute shared across all products.
              </span>
            </div>
            {!isEdit && (
              <div className="attr-field">
                <label className="attr-field__label">Values <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></label>
                <TagInput tags={tags} onChange={setTags} />
                <span className="attr-field__hint">
                  Press Enter or comma to add each value. You can add more later.
                </span>
              </div>
            )}
            {error && <p style={{ margin: 0, color: "#dc2626", fontSize: 13 }}>{error}</p>}
          </div>
          <div className="attr-modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Value modal (create / edit) ──────────────────────────────────────────────

function ValueModal({ attributeId, value, onClose, onSaved }) {
  const isEdit = Boolean(value?.id);
  const [text, setText] = useState(value?.value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) { setError("Value is required"); return; }
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await attributeService.updateValue(attributeId, value.id, { value: text.trim() });
      } else {
        await attributeService.addValue(attributeId, { value: text.trim() });
      }
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="attr-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="attr-modal">
        <div className="attr-modal__header">
          <h3 className="attr-modal__title">{isEdit ? "Edit Value" : "Add Value"}</h3>
          <button className="attr-modal__close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="attr-modal__body">
            <div className="attr-field">
              <label className="attr-field__label">Value</label>
              <input
                className="attr-field__input"
                placeholder="e.g. 75, Size 12, 18 inch"
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p style={{ margin: 0, color: "#dc2626", fontSize: 13 }}>{error}</p>}
          </div>
          <div className="attr-modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete confirm ────────────────────────────────────────────────────────────

function DeleteConfirm({ title, message, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(apiErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="attr-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="attr-modal">
        <div className="attr-modal__header">
          <h3 className="attr-modal__title">{title}</h3>
          <button className="attr-modal__close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="attr-confirm__body">{message}</div>
        {error && <p style={{ margin: "0 20px 12px", color: "#dc2626", fontSize: 13 }}>{error}</p>}
        <div className="attr-modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--danger" disabled={loading} onClick={confirm}>
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AttributesPage() {
  const dispatch = useDispatch();

  const rows         = useSelector(selectAttributeRows);
  const listStatus   = useSelector(selectAttributeListStatus);
  const selected     = useSelector(selectSelectedAttribute);
  const selectedStatus = useSelector(selectSelectedStatus);

  const [attrSearch, setAttrSearch] = useState("");
  const [valSearch,  setValSearch]  = useState("");

  // modals
  const [attrModal,    setAttrModal]    = useState(null); // null | "create" | attrObj
  const [valModal,     setValModal]     = useState(null); // null | "create" | valueObj
  const [deleteTarget, setDeleteTarget] = useState(null); // { type:"attr"|"value", item }

  // Fetch list on mount (or when invalidated)
  useEffect(() => {
    if (listStatus === "idle") {
      dispatch(fetchAttributes());
    }
  }, [listStatus, dispatch]);

  const selectAttr = (attr) => {
    setValSearch("");
    dispatch(fetchAttributeById(attr.id));
  };

  // ── filtered lists
  const filteredAttrs = rows.filter((a) =>
    a.name.toLowerCase().includes(attrSearch.toLowerCase()),
  );
  const filteredValues = (selected?.values ?? []).filter((v) =>
    v.value.toLowerCase().includes(valSearch.toLowerCase()),
  );

  // ── after mutations: invalidate Redux so next visit re-fetches
  const afterAttrSave = () => {
    setAttrModal(null);
    dispatch(invalidateAll());
    dispatch(fetchAttributes());
    if (selected) dispatch(fetchAttributeById(selected.id));
  };

  const afterValueSave = () => {
    setValModal(null);
    dispatch(fetchAttributeById(selected.id));
    dispatch(invalidateAll());
    dispatch(fetchAttributes());
  };

  // ── delete handlers
  const handleDeleteAttr = async () => {
    await attributeService.remove(deleteTarget.item.id);
    setDeleteTarget(null);
    if (selected?.id === deleteTarget.item.id) dispatch(clearSelected());
    dispatch(invalidateAll());
    dispatch(fetchAttributes());
  };

  const handleDeleteValue = async () => {
    await attributeService.removeValue(selected.id, deleteTarget.item.id);
    setDeleteTarget(null);
    dispatch(removeValueFromSelected(deleteTarget.item.id));
    dispatch(fetchAttributeById(selected.id));
    dispatch(fetchAttributes());
  };

  const loading         = listStatus === "loading";
  const selectedLoading = selectedStatus === "loading";

  return (
    <div className="attr-page">
      {/* Header */}
      <div className="attr-page__header">
        <div>
          <h1 className="attr-page__title">Variant Attributes</h1>
          <p className="attr-page__desc">
            Global attributes (Purity, Size, Length…) and their values are shared across all products.
            Assign them to product variants when creating or editing a product.
          </p>
        </div>
        <button className="btn btn--primary" onClick={() => setAttrModal("create")}>
          <Plus size={15} />
          New Attribute
        </button>
      </div>

      {/* Two-panel */}
      <div className="attr-panels">

        {/* ── Left: attribute list */}
        <div className="attr-list-panel">
          <div className="attr-list-panel__header">
            <div className="attr-list-panel__search">
              <Search size={14} />
              <input
                placeholder="Search attributes…"
                value={attrSearch}
                onChange={(e) => setAttrSearch(e.target.value)}
              />
              {attrSearch && (
                <button
                  style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", color: "var(--muted)" }}
                  onClick={() => setAttrSearch("")}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="attr-list">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="attr-skeleton" style={{ margin: "4px 0" }} />
              ))
            ) : filteredAttrs.length === 0 ? (
              <div className="attr-list__empty">
                {attrSearch
                  ? "No attributes match your search."
                  : "No attributes yet. Create one!"}
              </div>
            ) : (
              filteredAttrs.map((attr) => (
                <div
                  key={attr.id}
                  className={`attr-item${selected?.id === attr.id ? " attr-item--active" : ""}`}
                  onClick={() => selectAttr(attr)}
                >
                  <div className="attr-item__icon"><Tag size={16} /></div>
                  <div className="attr-item__body">
                    <div className="attr-item__name">{attr.name}</div>
                    <div className="attr-item__count">
                      {attr.values?.length ?? 0} value{(attr.values?.length ?? 0) !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="attr-item__actions">
                    <button
                      className="attr-item__btn"
                      title="Edit attribute"
                      onClick={(e) => { e.stopPropagation(); setAttrModal(attr); }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="attr-item__btn attr-item__btn--danger"
                      title="Delete attribute"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "attr", item: attr }); }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right: values panel */}
        <div className="attr-values-panel">
          {!selected && selectedStatus !== "loading" ? (
            <div className="attr-values-panel__empty-state">
              <Layers size={48} />
              <p>Select an attribute on the left<br />to manage its values.</p>
            </div>
          ) : (
            <>
              <div className="attr-values-panel__header">
                <div>
                  <h2 className="attr-values-panel__title">
                    {selectedLoading ? "Loading…" : selected?.name}
                  </h2>
                  <p className="attr-values-panel__subtitle">
                    {selectedLoading
                      ? ""
                      : `${selected?.values?.length ?? 0} value${(selected?.values?.length ?? 0) !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="attr-values-panel__actions">
                  <div className="attr-values-panel__search">
                    <Search size={13} />
                    <input
                      placeholder="Filter values…"
                      value={valSearch}
                      onChange={(e) => setValSearch(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn--primary btn--sm"
                    disabled={selectedLoading || !selected}
                    onClick={() => setValModal("create")}
                  >
                    <Plus size={13} />
                    Add Value
                  </button>
                </div>
              </div>

              {selectedLoading ? (
                <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="attr-skeleton" style={{ height: 46 }} />
                  ))}
                </div>
              ) : filteredValues.length === 0 ? (
                <div className="attr-values-panel__empty-state">
                  <Tag size={40} />
                  <p>
                    {valSearch
                      ? "No values match your search."
                      : `No values yet for "${selected?.name}". Add the first one!`}
                  </p>
                </div>
              ) : (
                <div className="attr-values-grid">
                  {filteredValues.map((val) => (
                    <div key={val.id} className="attr-value-chip">
                      <span className="attr-value-chip__label">{val.value}</span>
                      <div className="attr-value-chip__actions">
                        <button
                          className="attr-value-chip__btn"
                          title="Edit value"
                          onClick={() => setValModal(val)}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className="attr-value-chip__btn attr-value-chip__btn--danger"
                          title="Delete value"
                          onClick={() => setDeleteTarget({ type: "value", item: val })}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Attribute modal */}
      {attrModal && (
        <AttributeModal
          attr={attrModal === "create" ? null : attrModal}
          onClose={() => setAttrModal(null)}
          onSaved={afterAttrSave}
        />
      )}

      {/* Value modal */}
      {valModal && selected && (
        <ValueModal
          attributeId={selected.id}
          value={valModal === "create" ? null : valModal}
          onClose={() => setValModal(null)}
          onSaved={afterValueSave}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirm
          title={deleteTarget.type === "attr" ? "Delete Attribute" : "Delete Value"}
          message={
            deleteTarget.type === "attr" ? (
              <>
                Are you sure you want to delete{" "}
                <span className="attr-confirm__name">"{deleteTarget.item.name}"</span>?
                All its values will also be deleted and this cannot be undone.
              </>
            ) : (
              <>
                Delete value{" "}
                <span className="attr-confirm__name">"{deleteTarget.item.value}"</span>?
                This cannot be undone.
              </>
            )
          }
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteTarget.type === "attr" ? handleDeleteAttr : handleDeleteValue}
        />
      )}
    </div>
  );
}
