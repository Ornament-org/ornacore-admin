import { Bell, ChevronDown, Command, Menu, Search, Settings2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutAdmin } from "../../features/auth/store/authSlice.js";
import "../common/Avatar.scss";
import "../common/IconButton.scss";

export function Topbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [profileOpen, setProfileOpen] = useState(false);
  const role = user?.roles?.[0] || "User";
  const roleLabel = role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const handleLogout = async () => {
    await dispatch(logoutAdmin());
    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar">
      <button className="icon-button topbar__menu" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div className="topbar-search">
        <Search size={17} />
        <input placeholder="Search anything…" aria-label="Search administration toolbox" />
        <span>
          <Command size={12} /> K
        </span>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" aria-label="Quick settings">
          <Settings2 size={18} />
        </button>
        <button className="icon-button icon-button--notification" aria-label="Notifications">
          <Bell size={18} />
          <span>3</span>
        </button>
        <div className="topbar-profile">
          <button
            className="topbar-profile__button"
            onClick={() => setProfileOpen((value) => !value)}
          >
            <span className="avatar">{(user?.email?.[0] || "A").toUpperCase()}</span>
            <span className="topbar-profile__copy">
              <strong>{roleLabel}</strong>
              <small>{user?.email || "admin@ornacore.com"}</small>
            </span>
            <ChevronDown size={15} />
          </button>
          {profileOpen && (
            <div className="profile-menu">
              <div className="profile-menu__identity">
                <span className="avatar">{(user?.email?.[0] || "A").toUpperCase()}</span>
                <div>
                  <strong>{roleLabel}</strong>
                  <small>{user?.email || "admin@ornacore.com"}</small>
                </div>
              </div>
              <button onClick={() => navigate("/settings")}>Account settings</button>
              <button className="profile-menu__danger" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
