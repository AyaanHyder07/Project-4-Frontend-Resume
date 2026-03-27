import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import HomePage from "./pages/public/HomePage";
import PublicPortfolioPage from "./pages/public/PublicPortfolioPage";
import TemplatePreviewPage from "./pages/public/TemplatePreviewPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import Dashboard from "./pages/users/Dashboard";
import TemplatesPage from "./pages/users/TemplatesPage";
import AnalyticsPage from "./pages/users/AnalyticsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminResumesPage from "./pages/admin/AdminResumesPage";
import AdminPendingPage from "./pages/admin/AdminPendingPage";
import AdminLayoutsPage from "./pages/admin/AdminLayoutsPage";
import AdminThemeBuilderPage from "./pages/admin/AdminThemeBuilderPage";
import AdminTemplatesPage from "./pages/admin/AdminTemplatesPage";
import AdminSubscriptionsPage from "./pages/admin/AdminSubscriptionsPage";
import AdminRevenuePage from "./pages/admin/AdminRevenuePage";
import ContactsPage from "./pages/users/ContactsPage";
import UpgradePlanPage from "./components/user/UpgradePlanPage";
import AdminPlansPage from "./components/admin/AdminPlansPage";
import ResumesPage from "./pages/ResumesPage";
import ResumeEditorPage from "./pages/ResumeEditorPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/p/:slug" element={<PublicPortfolioPage />} />
      <Route path="/template-preview/:templateKey" element={<TemplatePreviewPage />} />

      <Route path="/dashboard" element={<ProtectedRoute role="ROLE_USER"><Dashboard /></ProtectedRoute>} />
      <Route path="/resumes" element={<ProtectedRoute role="ROLE_USER"><ResumesPage /></ProtectedRoute>} />
      <Route path="/resumes/:resumeId/edit" element={<ProtectedRoute role="ROLE_USER"><ResumeEditorPage /></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute role="ROLE_USER"><TemplatesPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute role="ROLE_USER"><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/contacts" element={<ProtectedRoute role="ROLE_USER"><ContactsPage /></ProtectedRoute>} />
      <Route path="/upgrade" element={<ProtectedRoute role="ROLE_USER"><UpgradePlanPage /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute role="ROLE_ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/resumes" element={<ProtectedRoute role="ROLE_ADMIN"><AdminResumesPage /></ProtectedRoute>} />
      <Route path="/admin/pending" element={<ProtectedRoute role="ROLE_ADMIN"><AdminPendingPage /></ProtectedRoute>} />
      <Route path="/admin/themes" element={<ProtectedRoute role="ROLE_ADMIN"><AdminThemeBuilderPage /></ProtectedRoute>} />
      <Route path="/admin/layouts" element={<ProtectedRoute role="ROLE_ADMIN"><AdminLayoutsPage /></ProtectedRoute>} />
      <Route path="/admin/templates" element={<ProtectedRoute role="ROLE_ADMIN"><AdminTemplatesPage /></ProtectedRoute>} />
      <Route path="/admin/plans" element={<ProtectedRoute role="ROLE_ADMIN"><AdminPlansPage /></ProtectedRoute>} />
      <Route path="/admin/subscriptions" element={<ProtectedRoute role="ROLE_ADMIN"><AdminSubscriptionsPage /></ProtectedRoute>} />
      <Route path="/admin/revenue" element={<ProtectedRoute role="ROLE_ADMIN"><AdminRevenuePage /></ProtectedRoute>} />

      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
