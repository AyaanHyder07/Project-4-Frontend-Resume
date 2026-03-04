import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Clock,
  Palette, Layout, LogOut,
} from "lucide-react";
// No CSS import — AdminDashboardLayout handles it

const AdminSidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const close = () => { if (window.innerWidth < 1024) setOpen(false); };

  return (
    <aside className={`admin-sidebar ${open ? "sidebar-open" : ""}`}>

      <div className="admin-sidebar-logo">
        Admin<span>.</span>
      </div>

      <nav className="admin-sidebar-nav">
        <span className="admin-nav-label">Main</span>
        <NavItem to="/admin/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard"         onClick={close} />
        <NavItem to="/admin/pending"   icon={<Clock size={16} />}           label="Pending Approvals" onClick={close} />
        <NavItem to="/admin/resumes"   icon={<FileText size={16} />}        label="All Resumes"       onClick={close} />

        <span className="admin-nav-label">Appearance</span>
        <NavItem to="/admin/themes"  icon={<Palette size={16} />} label="Themes"  onClick={close} />
        <NavItem to="/admin/layouts" icon={<Layout  size={16} />} label="Layouts" onClick={close} />
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-logout-btn" onClick={logout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
};

const NavItem = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => isActive ? "admin-nav-link active" : "admin-nav-link"}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default AdminSidebar;