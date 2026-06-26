import "./Skeleton.scss";

/**
 * Base shimmer block. Use width/height/r (border-radius) to shape it.
 * All skeleton components compose this primitive.
 */
export function Skeleton({ w, h = 14, r = 8, className = "", style }) {
  return (
    <div
      className={`skeleton${className ? ` ${className}` : ""}`}
      style={{ width: w, height: h, borderRadius: r, ...style }}
    />
  );
}
