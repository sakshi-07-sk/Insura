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
            {/* General Overview */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Role-Specific Workspaces with RBAC Protection */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/claims/dashboard" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLAIMS_OFFICER]}>
                  <ClaimsOfficerDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/investigator/dashboard" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}>
                  <InvestigatorDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analyst/dashboard" 
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}>
                  <AnalystDashboardPage />
                </ProtectedRoute>
              } 
            />

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
