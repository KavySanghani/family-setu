import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AuthGuard } from '../components/guards/AuthGuard';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { FamilyRegistryPage } from '../features/family/pages/FamilyRegistryPage';
import { SchemeCataloguePage } from '../features/schemes/pages/SchemeCataloguePage';
import { SchemeDetailPage } from '../features/schemes/pages/SchemeDetailPage';
import { ApplicationsPage } from '../features/applications/pages/ApplicationsPage';
import { BenefitsPage } from '../features/benefits/pages/BenefitsPage';
import { NotificationsPage } from '../features/notifications/pages/NotificationsPage';
import { OfficerDashboardPage } from '../features/officer/pages/OfficerDashboardPage';
import { Beneficiary360Page } from '../features/officer/pages/Beneficiary360Page';
import { OfficerFamiliesPage } from '../features/officer/pages/OfficerFamiliesPage';
import { SchemeFinderPage } from '../features/eligibility/pages/SchemeFinderPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<AuthGuard />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/families" element={<FamilyRegistryPage />} />
              <Route path="/schemes" element={<SchemeCataloguePage />} />
              <Route path="/schemes/:id" element={<SchemeDetailPage />} />
              <Route path="/find-schemes" element={<SchemeFinderPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/benefits" element={<BenefitsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/officer" element={<OfficerDashboardPage />} />
              <Route path="/officer/families" element={<OfficerFamiliesPage />} />
              <Route path="/officer/families/:familyId" element={<Beneficiary360Page />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
