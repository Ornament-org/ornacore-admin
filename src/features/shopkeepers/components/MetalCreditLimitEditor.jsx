import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/common/Button.jsx";

const normalizeRows = (value = []) =>
  value.map((row) => ({
    metalId: row.metalId ? String(row.metalId) : "",
    creditLimitGrams: row.creditLimitGrams ?? "",
  }));

export function MetalCreditLimitEditor({ metals = [], value = [], onChange }) {
  const rows = normalizeRows(value);
  const activeMetals = metals.filter((metal) => metal.isActive !== false);
  const selectedMetalIds = new Set(rows.map((row) => row.metalId).filter(Boolean));

  const updateRow = (index, patch) => {
    onChange?.(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    const nextMetal = activeMetals.find((metal) => !selectedMetalIds.has(String(metal.id)));
    onChange?.([...rows, { metalId: nextMetal ? String(nextMetal.id) : "", creditLimitGrams: "" }]);
  };

  const removeRow = (index) => {
    onChange?.(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="metal-limit-editor">
      {rows.length === 0 && (
        <div className="metal-limit-editor__empty">No metal credit limits configured.</div>
      )}
      {rows.map((row, index) => (
        <div className="metal-limit-editor__row" key={`${row.metalId || "new"}-${index}`}>
          <select
            value={row.metalId}
            onChange={(event) => updateRow(index, { metalId: event.target.value })}
          >
            <option value="">Select metal</option>
            {activeMetals.map((metal) => {
              const metalId = String(metal.id);
              return (
                <option
                  disabled={selectedMetalIds.has(metalId) && row.metalId !== metalId}
                  key={metal.id}
                  value={metal.id}
                >
                  {metal.name}
                </option>
              );
            })}
          </select>
          <input
            min="0"
            placeholder="Credit limit in gm"
            step="0.001"
            type="number"
            value={row.creditLimitGrams}
            onChange={(event) => updateRow(index, { creditLimitGrams: event.target.value })}
          />
          <Button icon={Trash2} type="button" variant="secondary" onClick={() => removeRow(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button icon={Plus} type="button" variant="secondary" onClick={addRow}>
        Add metal limit
      </Button>
    </div>
  );
}
