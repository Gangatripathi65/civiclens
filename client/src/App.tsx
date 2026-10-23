import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { CivicMapPage } from './pages/CivicMapPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/map" element={<CivicMapPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="citizen">
              <CitizenDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/report"
          element={
            <ProtectedRoute role="citizen">
              <ReportIssuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaints/:id"
          element={
            <ProtectedRoute>
              <ComplaintDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute role="admin">
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
