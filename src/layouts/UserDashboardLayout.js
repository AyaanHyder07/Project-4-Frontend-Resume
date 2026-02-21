import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function UserDashboardLayout() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand">Resume Dashboard</Link>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard/resumes" className={({ isActive }) => isActive ? 'active' : ''}>
            My Resumes
          </NavLink>
          <NavLink to="/dashboard/profile" className={({ isActive }) => isActive ? 'active' : ''}>
            Profile
          </NavLink>
          {isAdmin() && (
            <NavLink to="/admin/overview" className={({ isActive }) => isActive ? 'active' : ''}>
              Admin Dashboard
            </NavLink>
          )}
        </nav>
        <div className="sidebar-footer">
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
