import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export function PageHeader({ eyebrow = "Admin Toolbox", title, description, actions }) {
  return (
    <div className="page-header">
      <div>
        <div className="breadcrumb">
          <Link to="/dashboard">Home</Link>
          <ChevronRight size={13} />
          <span>{eyebrow}</span>
        </div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}
