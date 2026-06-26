import "./Avatar.scss";
import "./EntityCell.scss";

export function EntityCell({ initials, title, subtitle, imageUrl, imageAlt = "" }) {
  return (
    <div className="entity-cell">
      {imageUrl ? (
        <span className="entity-cell__image">
          <img alt={imageAlt} src={imageUrl} />
        </span>
      ) : (
        <span className="avatar avatar--soft">{initials}</span>
      )}
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}
