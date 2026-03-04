import { Menu } from "lucide-react";
// No CSS import here — UserDashboardLayout already imports user-layout.css

const UserTopbar = ({ title, subtitle, rightAction, toggleSidebar }) => {
  return (
    <div className="topbar">

      <div className="topbar-left">
        <button className="topbar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <Menu size={18} />
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
          {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
        </div>
      </div>

      {rightAction && (
        <div className="topbar-right">{rightAction}</div>
      )}

    </div>
  );
};

export default UserTopbar;