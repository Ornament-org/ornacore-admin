import clsx from "clsx";
import "./BrandMark.scss";

export function BrandMark({ compact = false, inverse = false, className }) {
  return (
    <div
      className={clsx(
        "brand-mark",
        compact && "brand-mark--compact",
        inverse && "brand-mark--inverse",
        className,
      )}
    >
      <svg className="brand-mark__symbol" viewBox="0 0 48 48" aria-hidden="true" fill="none">
        <path d="M24 3 33 12 24 21 15 12 24 3Z" />
        <path d="M24 27 33 36 24 45 15 36 24 27Z" />
        <path d="M3 24 12 15 21 24 12 33 3 24Z" />
        <path d="M27 24 36 15 45 24 36 33 27 24Z" />
        <circle cx="24" cy="24" r="4.5" />
      </svg>
      {!compact && (
        <span className="brand-mark__copy">
          <strong>ORNACORE</strong>
          <small>ADMIN TOOLBOX</small>
        </span>
      )}
    </div>
  );
}
