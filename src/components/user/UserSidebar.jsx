import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FileText, Layers,
  BarChart3, Settings, LogOut, Mail,
} from "lucide-react";
import SubscriptionBadge from "./SubscriptionBadge";

const UserSidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();

  const logout = () => { localStorage.clear(); navigate("/login"); };
  const close  = () => { if (window.innerWidth <= 768) setOpen(false); };

  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-logo">Résumé<span>.</span></div>

      <nav className="sidebar-menu">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={16}/>} label="Dashboard" onClick={close}/>
        <NavItem to="/resumes"   icon={<FileText size={16}/>}        label="Resumes"   onClick={close}/>
        <NavItem to="/templates" icon={<Layers size={16}/>}          label="Templates" onClick={close}/>
        <NavItem to="/analytics" icon={<BarChart3 size={16}/>}       label="Analytics" onClick={close}/>
        <NavItem to="/contacts"  icon={<Mail size={16}/>}            label="Contacts"  onClick={close}/>
        <NavItem to="/settings"  icon={<Settings size={16}/>}        label="Settings"  onClick={close}/>
      </nav>

      {/* ── subscription widget sits just above logout ── */}
      <SubscriptionBadge/>

      <button className="sidebar-logout" onClick={logout}>
        <LogOut size={16}/> <span>Logout</span>
      </button>
    </aside>
  );
};

const NavItem = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default UserSidebar;