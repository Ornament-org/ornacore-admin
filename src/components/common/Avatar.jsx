import clsx from "clsx";
import "./Avatar.scss";

export function Avatar({ initials, variant = "soft", className }) {
  return (
    <span className={clsx("avatar", variant === "soft" && "avatar--soft", className)}>
      {initials}
    </span>
  );
}
