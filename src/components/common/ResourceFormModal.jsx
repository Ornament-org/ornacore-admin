import { useEffect, useState } from "react";
import { apiErrorMessage } from "../../services/apiClient.js";
import { Button } from "./Button.jsx";
import { FormAlert } from "./FormAlert.jsx";
import { Modal } from "./Modal.jsx";

const initialValues = (fields, record) =>
  Object.fromEntries(
    fields.map((field) => [
      field.name,
      record?.[field.name] ?? field.defaultValue ?? (field.type === "checkbox" ? false : ""),
    ]),
  );

export function ResourceFormModal({
  open,
  title,
  description,
  fields,
  record,
  submitLabel = "Save",
  onClose,
  onSubmit,
}) {
  const [values, setValues] = useState(() => initialValues(fields, record));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues(fields, record));
      setError(null);
    }
  }, [fields, open, record]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = Object.fromEntries(
        fields
          .filter((field) => !field.readOnly && !field.hidden?.(values))
          .map((field) => {
            const value = values[field.name];
            if (field.serialize) return [field.name, field.serialize(value, values)];
            if (field.type === "number" && value !== "") return [field.name, Number(value)];
            if (field.type === "checkbox") return [field.name, Boolean(value)];
            if (field.nullable && value === "") return [field.name, null];
            return [field.name, value];
          }),
      );
      await onSubmit(payload);
      onClose();
    } catch (submitError) {
      setError(apiErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      <form className="resource-form" onSubmit={submit}>
        <div className="resource-form__grid">
          {fields.map((field) => {
            if (field.hidden?.(values)) return null;
            const options =
              typeof field.options === "function" ? field.options(values) : field.options;

            return (
              <label
                className={
                  field.fullWidth ? "resource-field resource-field--full" : "resource-field"
                }
                key={field.name}
              >
              <span>
                {field.label}
                {field.required && <em>*</em>}
              </span>
              {field.type === "custom" ? (
                field.render?.({
                  value: values[field.name],
                  values,
                  setValue: (nextValue) =>
                    setValues((current) => ({ ...current, [field.name]: nextValue })),
                  setValues,
                })
              ) : field.type === "select" ? (
                <select
                  required={field.required}
                  value={values[field.name]}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                >
                  <option value="">{field.emptyOptionLabel ?? `Select ${field.label.toLowerCase()}`}</option>
                  {(options ?? []).map((option) => (
                    <option key={option.value ?? option} value={option.value ?? option}>
                      {option.label ?? option}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  rows={field.rows ?? 4}
                  value={values[field.name]}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                />
              ) : field.type === "checkbox" ? (
                <input
                  checked={Boolean(values[field.name])}
                  type="checkbox"
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.checked }))
                  }
                />
              ) : (
                <input
                  min={field.min}
                  readOnly={field.readOnly}
                  required={field.required}
                  type={field.type ?? "text"}
                  value={values[field.name]}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                />
              )}
              </label>
            );
          })}
        </div>
        {error && <FormAlert>{error}</FormAlert>}
        <footer className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} type="submit">
            {submitLabel}
          </Button>
        </footer>
      </form>
    </Modal>
  );
}
