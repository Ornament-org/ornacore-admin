import clsx from "clsx";
import "./Button.scss";

const variants = {
  primary: "button--primary",
  secondary: "button--secondary",
  ghost: "button--ghost",
  danger: "button--danger",
};

export function Button({
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  children,
  className,
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      className={clsx("button", variants[variant], `button--${size}`, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="button__spinner" aria-hidden="true" />
      ) : (
        Icon && <Icon size={16} />
      )}
      <span>{loading ? "Please wait…" : children}</span>
    </button>
  );
}
