import clsx from "clsx";
import { useEffect, useState } from "react";
import "./StatusToggle.scss";

export function StatusToggle({
  checked,
  disabled = false,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  compact = false,
  onChange,
  onError,
}) {
  const [current, setCurrent] = useState(Boolean(checked));
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setCurrent(Boolean(checked));
  }, [checked]);

  const toggle = async () => {
    if (disabled || pending) return;

    const next = !current;
    setCurrent(next);
    setPending(true);
    try {
      await onChange?.(next);
    } catch (error) {
      setCurrent(!next);
      onError?.(error);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      aria-checked={current}
      aria-label={`Set status to ${current ? inactiveLabel : activeLabel}`}
      className={clsx("status-toggle", {
        "is-active": current,
        "is-inactive": !current,
        "is-pending": pending,
        "status-toggle--compact": compact,
      })}
      disabled={disabled || pending}
      role="switch"
      type="button"
      onClick={toggle}
    >
      <span className="status-toggle__track">
        <span className="status-toggle__thumb" />
      </span>
      <strong>{current ? activeLabel : inactiveLabel}</strong>
    </button>
  );
}
