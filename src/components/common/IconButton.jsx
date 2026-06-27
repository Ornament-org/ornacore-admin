import clsx from "clsx";
import "./IconButton.scss";

export function IconButton({ icon: Icon, size = 16, variant, title, className, ...props }) {
  return (
    <button
      type="button"
      className={clsx("icon-button", variant && `icon-button--${variant}`, className)}
      title={title}
      aria-label={title}
      {...props}
    >
      <Icon size={size} />
    </button>
  );
}
