import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ROLES } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

// Admin Dedicated Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AccessControl } from './pages/admin/AccessControl';
import { AllClaims } from './pages/admin/AllClaims';
import { SystemHealth } from './pages/admin/SystemHealth';
import { AuditLogs } from './pages/admin/AuditLogs';
import { ModelConfig } from './pages/admin/ModelConfig';

// Claims Officer Dedicated Pages
import { ClaimsDashboard } from './pages/claims/ClaimsDashboard';
import { SubmitClaim } from './pages/claims/SubmitClaim';
import { MyClaims } from './pages/claims/MyClaims';
import { ClaimStatus } from './pages/claims/ClaimStatus';
import { Notifications } from './pages/claims/Notifications';

// Fraud Investigator Dedicated Pages
import { InvestigatorDashboard } from './pages/investigator/InvestigatorDashboard';
import { InvestigationQueue } from './pages/investigator/InvestigationQueue';
import { HighRiskClaims } from './pages/investigator/HighRiskClaims';
import { AssignedCases } from './pages/investigator/AssignedCases';
import { ReviewHistory } from './pages/investigator/ReviewHistory';
import { InvestigationReports } from './pages/investigator/InvestigationReports';

// Risk Analyst Dedicated Pages
import { AnalystDashboard } from './pages/analyst/AnalystDashboard';
import { RiskDistribution } from './pages/analyst/RiskDistribution';
import { ModelPerformance } from './pages/analyst/ModelPerformance';
import { FraudTrends } from './pages/analyst/FraudTrends';
import { FalsePositives } from './pages/analyst/FalsePositives';
import { FairnessAnalysis } from './pages/analyst/FairnessAnalysis';
import { ModelReports } from './pages/analyst/ModelReports';

// Core Cross-Role Pages
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { ScoreClaimPage } from './pages/ScoreClaimPage';
import { ReviewCenterPage } from './pages/ReviewCenterPage';
import { ModelInsightsPage } from './pages/ModelInsightsPage';

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
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/access" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AccessControl /></ProtectedRoute>} />
            <Route path="/admin/claims" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AllClaims /></ProtectedRoute>} />
            <Route path="/admin/health" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><SystemHealth /></ProtectedRoute>} />
            <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AuditLogs /></ProtectedRoute>} />
            <Route path="/admin/model-config" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]}><ModelConfig /></ProtectedRoute>} />

            {/* Claims Officer Workspace & Sub-Routes */}
            <Route path="/claims/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLAIMS_OFFICER]}><ClaimsDashboard /></ProtectedRoute>} />
            <Route path="/claims/submit" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLAIMS_OFFICER]}><SubmitClaim /></ProtectedRoute>} />
            <Route path="/claims/my-claims" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLAIMS_OFFICER]}><MyClaims /></ProtectedRoute>} />
            <Route path="/claims/status" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLAIMS_OFFICER]}><ClaimStatus /></ProtectedRoute>} />
            <Route path="/claims/notifications" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CLAIMS_OFFICER]}><Notifications /></ProtectedRoute>} />

            {/* Fraud Investigator Workspace & Sub-Routes */}
            <Route path="/investigator/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}><InvestigatorDashboard /></ProtectedRoute>} />
            <Route path="/investigator/queue" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}><InvestigationQueue /></ProtectedRoute>} />
            <Route path="/investigator/high-risk" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}><HighRiskClaims /></ProtectedRoute>} />
            <Route path="/investigator/assigned" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}><AssignedCases /></ProtectedRoute>} />
            <Route path="/investigator/history" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}><ReviewHistory /></ProtectedRoute>} />
            <Route path="/investigator/reports" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.INVESTIGATOR]}><InvestigationReports /></ProtectedRoute>} />

            {/* Risk Analyst Workspace & Sub-Routes */}
            <Route path="/analyst/dashboard" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><AnalystDashboard /></ProtectedRoute>} />
            <Route path="/analyst/distribution" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><RiskDistribution /></ProtectedRoute>} />
            <Route path="/analyst/performance" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><ModelPerformance /></ProtectedRoute>} />
            <Route path="/analyst/trends" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><FraudTrends /></ProtectedRoute>} />
            <Route path="/analyst/false-positives" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><FalsePositives /></ProtectedRoute>} />
            <Route path="/analyst/fairness" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><FairnessAnalysis /></ProtectedRoute>} />
            <Route path="/analyst/reports" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ANALYST]}><ModelReports /></ProtectedRoute>} />

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
