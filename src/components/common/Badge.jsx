import clsx from "clsx";
import "./Badge.scss";

const toneMap = {
  success: "badge--success",
  warning: "badge--warning",
  danger: "badge--danger",
  info: "badge--info",
  purple: "badge--purple",
  neutral: "badge--neutral",
};

export function Badge({ children, tone = "neutral", dot = false, className }) {
  return (
    <span className={clsx("badge", toneMap[tone], className)}>
      {dot && <span className="badge__dot" />}
      {children}
    </span>
  );
}
