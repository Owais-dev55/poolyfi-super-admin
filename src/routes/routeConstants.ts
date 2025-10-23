// Route URL Constants
export const ROUTES = {
  // Public Routes
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Protected Routes (Dashboard)
  DASHBOARD: '/dashboard',
  COMPANIES: '/companies',
  COMPANY_DETAIL: '/company/:id',
  LEADERBOARD: '/leaderboard',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  
  // Root redirect
  ROOT: '/',
} as const;

// Route Groups
export const ROUTE_GROUPS = {
  PUBLIC: [ROUTES.LOGIN, ROUTES.FORGOT_PASSWORD],
  PROTECTED: [
    ROUTES.DASHBOARD,
    ROUTES.COMPANIES,
    ROUTES.COMPANY_DETAIL,
    ROUTES.LEADERBOARD,
    ROUTES.REPORTS,
    ROUTES.SETTINGS,
  ],
} as const;

// Route Labels for Navigation
export const ROUTE_LABELS = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.COMPANIES]: 'Companies',
  [ROUTES.LEADERBOARD]: 'Leaderboard',
  [ROUTES.REPORTS]: 'Reports',
  [ROUTES.SETTINGS]: 'Settings',
} as const;

// Route Icons for Navigation (Icon Keys)
export const ROUTE_ICONS = {
  [ROUTES.DASHBOARD]: 'dashboard',
  [ROUTES.COMPANIES]: 'companies',
  [ROUTES.LEADERBOARD]: 'leaderboard',
  [ROUTES.REPORTS]: 'reports',
  [ROUTES.SETTINGS]: 'settings',
} as const;

// Type definitions
export type RouteKey = keyof typeof ROUTES;
export type ProtectedRoute = typeof ROUTE_GROUPS.PROTECTED[number];
export type PublicRoute = typeof ROUTE_GROUPS.PUBLIC[number];
