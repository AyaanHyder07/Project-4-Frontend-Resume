import { Menu } from "lucide-react";
// No CSS import here — AdminDashboardLayout already imports admin-layout.css

const AdminTopbar = ({ title, subtitle, rightAction, toggleSidebar }) => (
  <header className="admin-topbar">

    <div className="admin-topbar-left">
      <button className="admin-hamburger" onClick={toggleSidebar} aria-label="Toggle sidebar">
        <Menu size={18} />
      </button>
      <div>
        <h1 className="admin-topbar-title">{title}</h1>
        {subtitle && <p className="admin-topbar-subtitle">{subtitle}</p>}
      </div>
    </div>

    {rightAction && (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {rightAction}
      </div>
    )}

  </header>
);

export default AdminTopbar;