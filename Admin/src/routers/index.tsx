import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/routers/layouts/AdminLayout';

import LoginPage from '@/pages/LoginPage';

import DashboardPage from '@/pages/Dashboard/DashboardPage';

import UsersPage from '@/pages/UserManagement/UsersPage';
import UserDetailPage from '@/pages/UserManagement/UserDetailPage';

import FacilitiesPage from '@/pages/FacilityManagement/FacilitesPage';
import FacilityDetailPage from '@/pages/FacilityManagement/FacilityDetailPage';

import FieldsPage from '@/pages/FieldManagement/FieldPage';
import FieldDetailPage from '@/pages/FieldManagement/FieldDetail/FieldDetailPage';

import ServicesPage from '@/pages/ServiceManagement/ServicePage';
import VouchersPage from '@/pages/VoucherManagement/VoucherPage'; 

import EventsPage from '@/pages/EventManagement/EventPage';

import ReviewsPage from '@/pages/ReviewManagement/ReviewPage';

import SupportsPage from '@/pages/SupportManagement/SupportPage'; 

import ReportsPage from '@/pages/ReportManagement/ReportPage';


import ApprovalPage from '@/pages/ApprovalManagement/ApprovalPage';

import SettingsPage from '@/pages/SettingManagement/SettingsPage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />      
      
      {/* Protected routes */}
      <Route element={
        // <ProtectedRoute>
          <AdminLayout />
        // </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:userId" element={<UserDetailPage />} />

        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/facilities/:facilityId" element={<FacilityDetailPage />} />

        <Route path="/approvals" element={<ApprovalPage />} />

        <Route path="/fields" element={<FieldsPage />} />
        <Route path="/fields/:fieldId" element={<FieldDetailPage />} />

        <Route path="/services" element={<ServicesPage />} />

        <Route path="/vouchers" element={<VouchersPage />} />

        <Route path="/events" element={<EventsPage />} />

        <Route path="/reviews" element={<ReviewsPage />} />

        <Route path="/supports" element={<SupportsPage />} />

        <Route path="/reports" element={<ReportsPage />} /> 

        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      {/* Default route to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;