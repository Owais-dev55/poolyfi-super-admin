import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routeConstants';
import { Layout } from '../components/layout';
import DashboardPage from '../pages/DashboardPage';
import CompanyManagementPage from '../pages/CompanyManagementPage';
import CompanyDetailPage from '../pages/CompanyDetailPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.DASHBOARD} element={<Layout />}>
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path={ROUTES.COMPANIES} element={<Layout />}>
        <Route index element={<CompanyManagementPage />} />
      </Route>
      <Route path={ROUTES.COMPANY_DETAIL} element={<Layout />}>
        <Route index element={<CompanyDetailPage />} />
      </Route>
      <Route path={ROUTES.LEADERBOARD} element={<Layout />}>
        <Route index element={<LeaderboardPage />} />
      </Route>
      <Route path={ROUTES.REPORTS} element={<Layout />}>
        <Route index element={<ReportsPage />} />
      </Route>
      <Route path={ROUTES.SETTINGS} element={<Layout />}>
        <Route index element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};

export default ProtectedRoutes;
