import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Layout from '../components/layout/Layout';

// Pages
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import LeadsPage from '../pages/LeadsPage';
import LeadDetailPage from '../pages/LeadDetailPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/leads"
        element={
          <PrivateRoute>
            <Layout>
              <LeadsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/leads/:id"
        element={
          <PrivateRoute>
            <Layout>
              <LeadDetailPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <Layout>
              <AnalyticsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route
        path="*"
        element={
          <PrivateRoute>
            <Layout>
              <NotFoundPage />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
