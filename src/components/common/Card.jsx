import clsx from "clsx";
import "./Card.scss";

export function Card({ children, className, padded = true, ...props }) {
  return (
    <section
      className={clsx("surface-card", padded && "surface-card--padded", className)}
      {...props}
    >
      {children}
    </section>
  );
}
