import { useState } from "react";
import { Check, Plus, Wand2, X } from "lucide-react";

function AttributeValueChip({ value, selected, onToggle }) {
  return (
    <button
      className={`variant-attribute-value ${selected ? "is-selected" : ""}`}
      type="button"
      onClick={onToggle}
    >
      {selected && <Check size={11} className="variant-attribute-value__check" />}
      {value}
    </button>
  );
}

function AddValueInline({ onAdd }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const trimmed = value.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await onAdd(trimmed);
      setValue("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="variant-attribute-add-value">
      <input
        placeholder="Add value…"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submit();
          }
        }}
      />
      <button disabled={saving || !value.trim()} type="button" onClick={submit}>
        <Plus size={13} />
      </button>
    </div>
  );
}

export function VariantOptionsBuilder({
  attributeCatalog,
  loadingAttributes,
  selectedRows,
  onChange,
  onGenerate,
  onAddValue,
}) {
  const availableAttributes = attributeCatalog.filter(
    (attribute) => !selectedRows.some((row) => String(row.attributeId) === String(attribute.id)),
  );

  const addRow = (attributeId) => {
    if (!attributeId) return;
    onChange([...selectedRows, { attributeId, valueIds: [] }]);
  };

  const removeRow = (attributeId) =>
    onChange(selectedRows.filter((row) => String(row.attributeId) !== String(attributeId)));

  const toggleValue = (attributeId, valueId) =>
    onChange(
      selectedRows.map((row) => {
        if (String(row.attributeId) !== String(attributeId)) return row;
        const has = row.valueIds.includes(valueId);
        return {
          ...row,
          valueIds: has ? row.valueIds.filter((id) => id !== valueId) : [...row.valueIds, valueId],
        };
      }),
    );

  if (loadingAttributes) {
    return <p className="wizard-note">Loading attributes…</p>;
  }

  if (!attributeCatalog.length) {
    return (
      <p className="wizard-note">
        No attributes exist yet. Create attributes like Size or Color from the Attributes page,
        then come back to build variants from them.
      </p>
    );
  }

  return (
    <div className="variant-options-builder">
      {selectedRows.map((row) => {
        const attribute = attributeCatalog.find((item) => String(item.id) === String(row.attributeId));
        if (!attribute) return null;
        return (
          <div className="variant-attribute-row" key={row.attributeId}>
            <div className="variant-attribute-row__header">
              <strong>{attribute.name}</strong>
              <button
                aria-label={`Remove ${attribute.name}`}
                className="variant-option-row__remove"
                type="button"
                onClick={() => removeRow(row.attributeId)}
              >
                <X size={14} />
              </button>
            </div>
            <div className="variant-attribute-values">
              {(attribute.values ?? []).map((value) => (
                <AttributeValueChip
                  key={value.id}
                  value={value.value}
                  selected={row.valueIds.includes(value.id)}
                  onToggle={() => toggleValue(row.attributeId, value.id)}
                />
              ))}
              <AddValueInline onAdd={(value) => onAddValue(attribute.id, value)} />
            </div>
          </div>
        );
      })}

      {availableAttributes.length > 0 && (
        <select value="" onChange={(event) => addRow(event.target.value)}>
          <option value="">+ Add attribute…</option>
          {availableAttributes.map((attribute) => (
            <option key={attribute.id} value={attribute.id}>
              {attribute.name}
            </option>
          ))}
        </select>
      )}

      <div className="variant-options-builder__actions">
        <button className="variant-options-builder__generate" type="button" onClick={onGenerate}>
          <Wand2 size={15} />
          Generate Variants
        </button>
      </div>
    </div>
  );
}
