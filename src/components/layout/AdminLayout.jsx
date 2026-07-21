import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { fetchBranding } from "../../features/settings/store/brandingSlice.js";
import { Sidebar } from "./Sidebar.jsx";
import { Topbar } from "./Topbar.jsx";
import "./Layout.scss";

export function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const displayName = useSelector((state) => state.branding.displayName);
  const favicon = useSelector((state) => state.branding.favicon);
  const brandingStatus = useSelector((state) => state.branding.status);

  useEffect(() => {
    if (brandingStatus === "idle") dispatch(fetchBranding());
  }, [dispatch, brandingStatus]);

  useEffect(() => {
    document.title = `${displayName} — Admin Toolbox`;
  }, [displayName]);

  // Falls back to index.html's default icon until Settings has a favicon configured.
  useEffect(() => {
    if (!favicon) return;
    const link = document.getElementById("app-favicon");
    if (link) link.href = favicon;
  }, [favicon]);

  return (
    <div className="admin-shell">
      <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="admin-shell__main">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
