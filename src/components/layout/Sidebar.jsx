import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BrandMark } from "../common/BrandMark.jsx";
import { navigationGroups } from "../../data/navigation.js";

function SidebarItem({ item, onNavigate }) {
  const location = useLocation();
  const isSectionActive =
    location.pathname === item.path ||
    item.children?.some((child) => location.pathname === child.path);
  const [expanded, setExpanded] = useState(isSectionActive);
  const isExpanded = expanded || isSectionActive;

  if (!item.children) {
    return (
      <NavLink
        to={item.path}
        onClick={onNavigate}
        className={({ isActive }) => clsx("sidebar-link", isActive && "sidebar-link--active")}
      >
        <item.icon size={17} />
        <span>{item.label}</span>
      </NavLink>
    );
  }

  return (
    <div className={clsx("sidebar-tree", isSectionActive && "sidebar-tree--active")}>
      <button className="sidebar-link" onClick={() => setExpanded((value) => !value)}>
        <item.icon size={17} />
        <span>{item.label}</span>
        <ChevronDown
          className={clsx("sidebar-link__chevron", isExpanded && "sidebar-link__chevron--open")}
          size={15}
        />
      </button>
      {isExpanded && (
        <div className="sidebar-children">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                clsx("sidebar-child-link", isActive && "sidebar-child-link--active")
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ open, onClose }) {
  const groups = useMemo(() => navigationGroups, []);

  return (
    <>
      <div
        className={clsx("sidebar-backdrop", open && "sidebar-backdrop--open")}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={clsx("sidebar", open && "sidebar--open")}>
        <div className="sidebar__header">
          <BrandMark inverse />
          <button className="sidebar__close" onClick={onClose} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>
        <div className="sidebar__rule" />
        <nav className="sidebar__nav">
          {groups.map((group) => (
            <div className="sidebar-group" key={group.label}>
              <span className="sidebar-group__label">{group.label}</span>
              {group.items.map((item) => (
                <SidebarItem item={item} key={item.label} onNavigate={onClose} />
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__environment">
            <span className="status-pulse" />
            <div>
              <strong>API connected</strong>
              <small>Development environment</small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
