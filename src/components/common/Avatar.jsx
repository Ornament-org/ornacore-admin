import clsx from "clsx";
import "./Avatar.scss";

export function Avatar({ initials, imageUrl, imageAlt = "", variant = "soft", className }) {
  return (
    <span className={clsx("avatar", variant === "soft" && "avatar--soft", className)}>
      {imageUrl ? <img src={imageUrl} alt={imageAlt} /> : initials}
    </span>
  );
}
