import clsx from "clsx";
import "./FormField.scss";

export function FormField({ label, error, hint, icon: Icon, trailing, className, children }) {
  return (
    <label className={clsx("form-field", className)}>
      {label && <span className="form-field__label">{label}</span>}
      <span className={clsx("form-field__control", error && "form-field__control--error")}>
        {Icon && <Icon className="form-field__icon" size={17} />}
        {children}
        {trailing}
      </span>
      {error ? (
        <span className="form-field__error">{error}</span>
      ) : (
        hint && <span className="form-field__hint">{hint}</span>
      )}
    </label>
  );
}
