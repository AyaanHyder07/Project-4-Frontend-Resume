import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import UserDashboardLayout from './layouts/UserDashboardLayout';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';

import MyResumesPage from './pages/user/MyResumesPage';
import ResumeEditorPage from './pages/user/ResumeEditorPage';
import VersionHistoryPage from './pages/user/VersionHistoryPage';
import PublicLinkPage from './pages/user/PublicLinkPage';
import ProfilePage from './pages/user/ProfilePage';

import OverviewPage from './pages/admin/OverviewPage';
import ModerationPage from './pages/admin/ModerationPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import PublishedResumesPage from './pages/admin/PublishedResumesPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AuditLogPage from './pages/admin/AuditLogPage';

import PublicResumePage from './pages/public/PublicResumePage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/resume/:id" element={<PublicResumePage />} />

      <Route path="/dashboard" element={<ProtectedRoute><UserDashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="resumes" replace />} />
        <Route path="resumes" element={<MyResumesPage />} />
        <Route path="resumes/:id" element={<ResumeEditorPage />} />
        <Route path="resumes/:id/versions" element={<VersionHistoryPage />} />
        <Route path="resumes/:id/link" element={<PublicLinkPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminDashboardLayout /></AdminRoute>}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="moderation" element={<ModerationPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="published" element={<PublishedResumesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="audit" element={<AuditLogPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
