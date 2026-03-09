import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

/* ── PUBLIC PAGES ── */
import HomePage            from "./pages/public/HomePage";
import PublicPortfolioPage from "./pages/public/PublicPortfolioPage";

/* ── AUTH PAGES ── */
import LoginPage    from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// /* ── USER PAGES ── */
import Dashboard        from "./pages/user/Dashboard";
import ResumesPage      from "./pages/user/ResumesPage";
import ResumeEditorPage from "./pages/user/ResumeEditorPage";
import ResumeCreatePage from "./pages/user/ResumeCreatePage";
import TemplatesPage    from "./pages/user/TemplatesPage";
import AnalyticsPage    from "./pages/user/AnalyticsPage";
import SettingsPage     from "./pages/user/SettingsPage";


/* ── ADMIN PAGES ── */
import AdminDashboard   from "./pages/admin/AdminDashboard";
import AdminResumesPage from "./pages/admin/AdminResumesPage";
import AdminPendingPage from "./pages/admin/AdminPendingPage";

import AdminLayoutsPage from "./pages/admin/AdminLayoutsPage";
import AdminThemeBuilderPage from "./pages/admin/AdminThemeBuilderPage";
// import Dashboard from "./pages/Userss/Dashboard";
// import ResumesPage from "./pages/Userss/ResumesPage";
// import ResumeEditorPage from "./pages/Userss/ResumeEditorPage";
// import TemplatesPage from "./pages/Userss/TemplatesPage";
// import AnalyticsPage from "./pages/Userss/AnalyticsPage";
import ContactsPage from "./pages/user/ContactsPage";


function App() {
  return (
    <Routes>

          {/* ═══════════════════════════════
              PUBLIC ROUTES — no auth needed
          ═══════════════════════════════ */}
          <Route path="/"          element={<HomePage />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />

          {/* Public portfolio by slug */}
          <Route path="/p/:slug"   element={<PublicPortfolioPage />} />


          {/* ═══════════════════════════════
              USER PROTECTED ROUTES
              role must be "ROLE_USER"
          ═══════════════════════════════ */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="ROLE_USER">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resumes"
            element={
              <ProtectedRoute role="ROLE_USER">
                <ResumesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resumes/new"
            element={
              <ProtectedRoute role="ROLE_USER">
                <ResumeCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resumes/:resumeId"
            element={
              <ProtectedRoute role="ROLE_USER">
                <ResumeEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute role="ROLE_USER">
                <TemplatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute role="ROLE_USER">
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/contacts" element={
  <ProtectedRoute role="ROLE_USER">
    <ContactsPage />
  </ProtectedRoute>
} />
          {/* <Route
            path="/analytics/:resumeId"
            element={
              <ProtectedRoute role="ROLE_USER">
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute role="ROLE_USER">
                <SettingsPage />
              </ProtectedRoute>
            }
          /> */}


          {/* ═══════════════════════════════
              ADMIN PROTECTED ROUTES
              role must be "ROLE_ADMIN"
          ═══════════════════════════════ */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resumes"
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <AdminResumesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pending"
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <AdminPendingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/themes"
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <AdminThemeBuilderPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/layouts"
            element={
              <ProtectedRoute role="ROLE_ADMIN">
                <AdminLayoutsPage />
              </ProtectedRoute>
            }
          />

          {/* Shortcut redirect */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />


          {/* ═══════════════════════════════
              FALLBACK 404
          ═══════════════════════════════ */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;