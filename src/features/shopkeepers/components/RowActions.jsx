import { Ban, CircleOff, Edit2, Eye, MoreVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RowActions.scss";

const MENU_ITEMS = [
  { label: "View", icon: Eye, action: "view" },
  { label: "Edit", icon: Edit2, action: "edit" },
  { label: "Suspend", icon: CircleOff, action: "suspend" },
  { label: "Delete", icon: Trash2, action: "delete", danger: true },
];

export function RowActions({ row, onAction }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleItem = (action) => {
    setOpen(false);
    if (action === "view") {
      navigate(`/shopkeepers/${row.id}`);
    } else {
      onAction?.(action, row);
    }
  };

  return (
    <div className="row-actions" ref={wrapRef}>
      <button
        type="button"
        className="row-actions__btn"
        title="View details"
        onClick={() => navigate(`/shopkeepers/${row.id}`)}
        aria-label="View shopkeeper"
      >
        <Eye size={14} />
      </button>

      <div className="row-actions__menu-wrap">
        <button
          type="button"
          className="row-actions__btn"
          title="More actions"
          aria-label="More actions"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <MoreVertical size={14} />
        </button>

        {open && (
          <div className="row-actions__dropdown" role="menu">
            {MENU_ITEMS.map(({ label, icon: Icon, action, danger }) => (
              <button
                key={action}
                type="button"
                role="menuitem"
                className={`row-actions__item${danger ? " row-actions__item--danger" : ""}`}
                onClick={() => handleItem(action)}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
