import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ROLES } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

// Role-Specific Workspaces
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ClaimsOfficerDashboardPage } from './pages/ClaimsOfficerDashboardPage';
import { InvestigatorDashboardPage } from './pages/InvestigatorDashboardPage';
import { AnalystDashboardPage } from './pages/AnalystDashboardPage';
import { ProfilePage } from './pages/ProfilePage';

// Core Application Pages
import { DashboardPage } from './pages/DashboardPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { ScoreClaimPage } from './pages/ScoreClaimPage';
import { ReviewCenterPage } from './pages/ReviewCenterPage';
import { ModelInsightsPage } from './pages/ModelInsightsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Authenticated Application Shell */}
          <Route element={<AppLayout />}>
            {/* General Overview & Profile */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin Role Workspace & Sub-Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/access" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/claims" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ClaimsPage /></ProtectedRoute>} />
            <Route path="/admin/health" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/model-config" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboardPage /></ProtectedRoute>} />

            {/* Claims Officer Workspace & Sub-Routes */}
            <Route path="/claims/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLAIMS_OFFICER]}><ClaimsOfficerDashboardPage /></ProtectedRoute>} />
            <Route path="/claims/submit" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLAIMS_OFFICER]}><ClaimsOfficerDashboardPage /></ProtectedRoute>} />
            <Route path="/claims/my-claims" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLAIMS_OFFICER]}><ClaimsOfficerDashboardPage /></ProtectedRoute>} />
            <Route path="/claims/status" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLAIMS_OFFICER]}><ClaimsOfficerDashboardPage /></ProtectedRoute>} />
            <Route path="/claims/notifications" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLAIMS_OFFICER]}><ClaimsOfficerDashboardPage /></ProtectedRoute>} />

            {/* Fraud Investigator Workspace & Sub-Routes */}
            <Route path="/investigator/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}><InvestigatorDashboardPage /></ProtectedRoute>} />
            <Route path="/investigator/queue" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}><InvestigatorDashboardPage /></ProtectedRoute>} />
            <Route path="/investigator/high-risk" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}><InvestigatorDashboardPage /></ProtectedRoute>} />
            <Route path="/investigator/assigned" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}><InvestigatorDashboardPage /></ProtectedRoute>} />
            <Route path="/investigator/history" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}><InvestigatorDashboardPage /></ProtectedRoute>} />
            <Route path="/investigator/reports" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}><InvestigatorDashboardPage /></ProtectedRoute>} />

            {/* Risk Analyst Workspace & Sub-Routes */}
            <Route path="/analyst/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><AnalystDashboardPage /></ProtectedRoute>} />
            <Route path="/analyst/distribution" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><AnalystDashboardPage /></ProtectedRoute>} />
            <Route path="/analyst/performance" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><AnalystDashboardPage /></ProtectedRoute>} />
            <Route path="/analyst/trends" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><AnalystDashboardPage /></ProtectedRoute>} />
            <Route path="/analyst/false-positives" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><AnalystDashboardPage /></ProtectedRoute>} />
            <Route path="/analyst/fairness" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><AnalystDashboardPage /></ProtectedRoute>} />
            <Route path="/analyst/reports" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><AnalystDashboardPage /></ProtectedRoute>} />

            {/* Shared Operational Tools */}
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/score" element={<ScoreClaimPage />} />
            <Route path="/reviews" element={<ReviewCenterPage />} />
            <Route path="/insights" element={<ModelInsightsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
