// Centralized data exports - import specific items to avoid conflicts
export { 
  employeeDistributionData, 
  analyticsMetrics, 
  rideTrendsSummary 
} from './analyticsData';

export { 
  rideTrendsData, 
  employeePerformanceData, 
  rideTypesData, 
  monthlyRevenueData, 
  efficiencyData, 
  peakHoursData, 
  costAnalysisData, 
  routeEfficiencyData, 
  metrics 
} from './analyticsPageData';

export { 
  dashboardMetrics, 
  recentActivities, 
  quickActions, 
  ridesData, 
  employeePerformance, 
  monthlyTrends 
} from './dashboardData';

export { companies } from './leaderboardData';

// Export types separately
export type { Company as LeaderboardCompany } from './leaderboardData';