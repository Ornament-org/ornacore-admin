import { CheckCircle2, CircleOff, Edit2, Eye, MoreVertical, Trash2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./RowActions.scss";

// Mirrors the backend's allowed "approve from" statuses (see the `approve`
// handler in shopkeeper.controller.js) — PENDING_REVIEW, REJECTED, SUSPENDED
// and DRAFT can all be approved directly. BLOCKED is deliberately excluded:
// the backend has no path back from it via this action.
const APPROVABLE_STATUSES = ["PENDING_REVIEW", "REJECTED", "SUSPENDED", "DRAFT"];

const PENDING_MENU_ITEMS = [
  { label: "Approve", icon: CheckCircle2, action: "approve" },
  { label: "Reject", icon: XCircle, action: "reject" },
  { label: "Edit", icon: Edit2, action: "edit" },
  { label: "Delete", icon: Trash2, action: "delete", danger: true },
];

// Suspended/Rejected/Draft shops can be resumed straight back to Approved —
// without this, there's no way to reverse a suspension from the list view.
const RESUMABLE_MENU_ITEMS = [
  { label: "View", icon: Eye, action: "view" },
  { label: "Approve", icon: CheckCircle2, action: "approve" },
  { label: "Edit", icon: Edit2, action: "edit" },
  { label: "Delete", icon: Trash2, action: "delete", danger: true },
];

const DEFAULT_MENU_ITEMS = [
  { label: "View", icon: Eye, action: "view" },
  { label: "Edit", icon: Edit2, action: "edit" },
  { label: "Suspend", icon: CircleOff, action: "suspend" },
  { label: "Delete", icon: Trash2, action: "delete", danger: true },
];

export function RowActions({ row, onAction }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const isPending = row.status === "PENDING_REVIEW";
  const isResumable = !isPending && APPROVABLE_STATUSES.includes(row.status);
  const menuItems = isPending ? PENDING_MENU_ITEMS : isResumable ? RESUMABLE_MENU_ITEMS : DEFAULT_MENU_ITEMS;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (
        !triggerRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    // The dropdown is portaled to <body>, so it isn't clipped by the table's
    // horizontal scroll container — but that also means its position doesn't
    // follow the trigger on scroll, so just close it instead of drifting.
    const handleScrollOrResize = () => setOpen(false);

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open]);

  const toggleMenu = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    setOpen((value) => !value);
  };

  const handleItem = (action) => {
    setOpen(false);
    if (action === "view") {
      navigate(`/shopkeepers/${row.id}`);
    } else {
      onAction?.(action, row);
    }
  };

  return (
    <div className="row-actions">
      <button
        type="button"
        className="row-actions__btn"
        title={isPending ? "Approve this shop before viewing details" : "View details"}
        aria-label={isPending ? "Approve this shop before viewing details" : "View shopkeeper"}
        disabled={isPending}
        onClick={() => navigate(`/shopkeepers/${row.id}`)}
      >
        <Eye size={14} />
      </button>

      <div className="row-actions__menu-wrap">
        <button
          ref={triggerRef}
          type="button"
          className="row-actions__btn"
          title="More actions"
          aria-label="More actions"
          aria-expanded={open}
          onClick={toggleMenu}
        >
          <MoreVertical size={14} />
        </button>

        {open &&
          menuPosition &&
          createPortal(
            <div
              ref={menuRef}
              className="row-actions__dropdown row-actions__dropdown--portal"
              style={{ top: menuPosition.top, right: menuPosition.right }}
              role="menu"
            >
              {menuItems.map(({ label, icon: Icon, action, danger }) => (
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
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}
