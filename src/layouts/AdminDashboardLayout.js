import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function AdminDashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand">Admin</Link>
        <nav className="sidebar-nav">
          <NavLink to="/admin/overview" className={({ isActive }) => isActive ? 'active' : ''}>Overview</NavLink>
          <NavLink to="/admin/moderation" className={({ isActive }) => isActive ? 'active' : ''}>Moderation</NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>Users</NavLink>
          <NavLink to="/admin/published" className={({ isActive }) => isActive ? 'active' : ''}>Published</NavLink>
          <NavLink to="/admin/analytics" className={({ isActive }) => isActive ? 'active' : ''}>Analytics</NavLink>
          <NavLink to="/admin/audit" className={({ isActive }) => isActive ? 'active' : ''}>Audit Log</NavLink>
        </nav>
        <div className="sidebar-footer">
          <Link to="/dashboard" className="btn btn-ghost btn-sm">User View</Link>
          <span className="sidebar-user">{user?.email}</span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="dashboard-main fade-in">
        <Outlet />
      </main>
    </div>
  );
}
