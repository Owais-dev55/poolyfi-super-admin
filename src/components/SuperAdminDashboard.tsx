import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  dashboardMetrics,
  quickActions,
  ridesData,
  employeePerformance
} from '../data/dashboardData';
import AddCompanyModal from './AddCompanyModal';
import { getNotifications } from '../api/notifications/api';
import type { Notification } from '../api/notifications/api';
import { getDashboardMeta } from '../api/dashboard/api';
import type { DashboardMetaData } from '../api/dashboard/api';
import { getCompanyPerformance, type PerformanceFilter, type CompanyPerformanceData } from '../api/companiesMeta/api';
import { customToast } from '../utils/useCustomToast';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Filter states for both charts
  const [trendFilter, setTrendFilter] = useState('week');
  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>('weekly');
  
  // Modal state for Add Company
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);

  // Dashboard metadata state
  const [dashboardMeta, setDashboardMeta] = useState<DashboardMetaData | null>(null);
  const [isDashboardMetaLoading, setIsDashboardMetaLoading] = useState(false);

  // Company Performance state
  const [companyPerformanceData, setCompanyPerformanceData] = useState<CompanyPerformanceData[]>([]);
  const [isPerformanceLoading, setIsPerformanceLoading] = useState(false);

  // Fetch dashboard metadata and notifications on component mount
  useEffect(() => {
    let isCancelled = false;

    const fetchDashboardData = async () => {
      // Fetch dashboard metadata
      try {
        setIsDashboardMetaLoading(true);
        const metaResponse = await getDashboardMeta();
        
        // Check if component is still mounted before updating state
        if (!isCancelled) {
          if (metaResponse.hasError) {
            throw new Error(metaResponse.message || 'Failed to fetch dashboard metadata');
          }
          
          setDashboardMeta(metaResponse.data);
        }
      } catch (error: any) {
        if (!isCancelled) {
          console.error('Failed to fetch dashboard metadata:', error);
          customToast.error(error.message || 'Failed to fetch dashboard metadata');
          setDashboardMeta(null);
        }
      } finally {
        if (!isCancelled) {
          setIsDashboardMetaLoading(false);
        }
      }

      // Fetch notifications
      try {
        setIsNotificationsLoading(true);
        const notificationsResponse = await getNotifications(5, 1);
        
        // Check if component is still mounted before updating state
        if (!isCancelled) {
          if (notificationsResponse.hasError) {
            throw new Error(notificationsResponse.message || 'Failed to fetch notifications');
          }
          
          setNotifications(notificationsResponse.data);
        }
      } catch (error: any) {
        if (!isCancelled) {
          console.error('Failed to fetch notifications:', error);
          customToast.error(error.message || 'Failed to fetch notifications');
          setNotifications([]);
        }
      } finally {
        if (!isCancelled) {
          setIsNotificationsLoading(false);
        }
      }
    };

    fetchDashboardData();

    // Cleanup function to cancel the request if component unmounts
    return () => {
      isCancelled = true;
    };
  }, []);

  // Fetch company performance data when filter changes
  useEffect(() => {
    const fetchCompanyPerformance = async () => {
      try {
        setIsPerformanceLoading(true);
        console.log('🚀 Fetching company performance with filter:', performanceFilter);
        const response = await getCompanyPerformance(performanceFilter);
        
        console.log('📦 Company Performance API Response:', response);
        
        if (response.hasError) {
          throw new Error(response.message || 'Failed to fetch company performance data');
        }
        
        // Extract the nested data array from response.data.data
        const performanceData = response.data.data || [];
        console.log('✅ Extracted performance data:', performanceData);
        console.log('📊 Number of companies:', performanceData.length);
        console.log('📋 Company names:', performanceData.map((item: CompanyPerformanceData) => item.companyName));
        setCompanyPerformanceData(performanceData);
      } catch (error: any) {
        console.error('❌ Failed to fetch company performance:', error);
        customToast.error(error.message || 'Failed to fetch company performance data');
        // Keep empty array, will use fallback mock data in render
        setCompanyPerformanceData([]);
      } finally {
        setIsPerformanceLoading(false);
      }
    };

    fetchCompanyPerformance();
  }, [performanceFilter]);

  // Helper function to format time
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

  // Generate sample data for different time periods
  const generateCompanyTrendData = (period: string) => {
    switch (period) {
      case 'day':
        return [
          { name: '12 AM', companies: 2, revenue: 2000 },
          { name: '3 AM', companies: 0, revenue: 0 },
          { name: '6 AM', companies: 5, revenue: 5000 },
          { name: '9 AM', companies: 12, revenue: 12000 },
          { name: '12 PM', companies: 18, revenue: 18000 },
          { name: '3 PM', companies: 15, revenue: 15000 },
          { name: '6 PM', companies: 22, revenue: 22000 },
          { name: '9 PM', companies: 8, revenue: 8000 }
        ];
      case 'week':
        return ridesData; // Default weekly data
      case 'month':
        return [
          { name: 'Week 1', companies: 45, revenue: 45000 },
          { name: 'Week 2', companies: 52, revenue: 52000 },
          { name: 'Week 3', companies: 48, revenue: 48000 },
          { name: 'Week 4', companies: 61, revenue: 61000 }
        ];
      case 'year':
        return [
          { name: 'Jan', companies: 180, revenue: 180000 },
          { name: 'Feb', companies: 195, revenue: 195000 },
          { name: 'Mar', companies: 210, revenue: 210000 },
          { name: 'Apr', companies: 225, revenue: 225000 },
          { name: 'May', companies: 240, revenue: 240000 },
          { name: 'Jun', companies: 255, revenue: 255000 },
          { name: 'Jul', companies: 270, revenue: 270000 },
          { name: 'Aug', companies: 255, revenue: 255000 },
          { name: 'Sep', companies: 280, revenue: 280000 },
          { name: 'Oct', companies: 265, revenue: 265000 },
          { name: 'Nov', companies: 250, revenue: 250000 },
          { name: 'Dec', companies: 235, revenue: 235000 }
        ];
      default:
        return ridesData;
    }
  };

  const generatePerformanceData = (period: string) => {
    switch (period) {
      case 'day':
        return [
          { name: 'TechCorp', rides: 45, rating: 4.8 },
          { name: 'Green Energy', rides: 38, rating: 4.9 },
          { name: 'Finance First', rides: 42, rating: 4.7 },
          { name: 'HealthTech', rides: 35, rating: 4.6 },
          { name: 'RetailMax', rides: 40, rating: 4.8 }
        ];
      case 'week':
        return employeePerformance; // Default weekly data
      case 'month':
        return [
          { name: 'TechCorp', rides: 1250, rating: 4.8 },
          { name: 'Green Energy', rides: 980, rating: 4.9 },
          { name: 'Finance First', rides: 750, rating: 4.7 },
          { name: 'HealthTech', rides: 650, rating: 4.6 },
          { name: 'RetailMax', rides: 580, rating: 4.8 }
        ];
      case 'year':
        return [
          { name: 'TechCorp', rides: 15000, rating: 4.8 },
          { name: 'Green Energy', rides: 12000, rating: 4.9 },
          { name: 'Finance First', rides: 9000, rating: 4.7 },
          { name: 'HealthTech', rides: 7800, rating: 4.6 },
          { name: 'RetailMax', rides: 7000, rating: 4.8 }
        ];
      default:
        return employeePerformance;
    }
  };

  // Memoized filtered data
  const filteredTrendData = useMemo(() => generateCompanyTrendData(trendFilter), [trendFilter]);
  const filteredPerformanceData = useMemo(() => generatePerformanceData(performanceFilter), [performanceFilter]);

  // Handler functions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-company':
        setIsAddCompanyModalOpen(true);
        break;
      case 'leaderboard':
        navigate('/leaderboard');
        break;
      case 'analytics':
        // Scroll to the analytics charts section
        const chartsSection = document.getElementById('analytics-charts');
        if (chartsSection) {
          chartsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const handleAddCompany = (companyData: any) => {
    // Here you would typically send the data to your API
    console.log('Adding company:', companyData);
    // Close modal
    setIsAddCompanyModalOpen(false);
  };

  return (
    <div className="min-h-full">
      {/* Main Content */}
      <div className="p-5">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {isDashboardMetaLoading ? (
            // Loading state - show skeleton for all 4 cards
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-5">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : dashboardMeta ? (
            // API data - display actual metrics
            [
              {
                title: 'Total Companies',
                value: dashboardMeta.totalCompanies.toString(),
                change: '+0% vs last month',
                changeType: 'positive',
                icon: dashboardMetrics[0].icon,
                iconColor: dashboardMetrics[0].iconColor
              },
              {
                title: 'Active Rides',
                value: dashboardMeta.activeRides.toString(),
                change: '+0 vs yesterday',
                changeType: 'positive',
                icon: dashboardMetrics[1].icon,
                iconColor: dashboardMetrics[1].iconColor
              },
              {
                title: 'Monthly Rides',
                value: dashboardMeta.monthlyRides.toLocaleString(),
                change: '+0% vs last month',
                changeType: 'positive',
                icon: dashboardMetrics[2].icon,
                iconColor: dashboardMetrics[2].iconColor
              },
              {
                title: 'Revenue Generated',
                value: `$${dashboardMeta.totalRevenue.toLocaleString()}`,
                change: '+0% vs last month',
                changeType: 'positive',
                icon: dashboardMetrics[3].icon,
                iconColor: dashboardMetrics[3].iconColor
              }
            ].map((metric, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-caption mb-1 text-gray-600">{metric.title}</p>
                    <p className="text-xl font-display text-gray-900">{metric.value}</p>
                    <p className={`text-xs font-body ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </p>
                  </div>
                  <div className={`text-2xl ${metric.iconColor}`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Fallback to static data if API fails
            dashboardMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-caption mb-1 text-gray-600">{metric.title}</p>
                    <p className="text-xl font-display text-gray-900">{metric.value}</p>
                    <p className={`text-xs font-body ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change}
                  </p>
                </div>
                  <div className={`text-2xl ${metric.iconColor}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
              </div>
            ))
               )}
        </div>

        {/* Activity and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Live Activity Feed */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.9559465,17 L16.8572173,9.21455489 C16.5341878,6.92561193 14.3163933,5 12,5 C9.68662535,5 7.4656614,6.92648519 7.14273575,9.21456958 L6.04394973,17 L17.9559465,17 Z M5.16236174,8.93507221 C5.62497658,5.65722234 8.69303423,3 12,3 C15.3137085,3 18.3754003,5.66003534 18.8375934,8.93507221 L19.978875,17.0220385 C20.1330409,18.1144365 19.3700367,19 18.2657828,19 L5.73409618,19 C4.63381562,19 3.86648583,18.1169798 4.02101887,17.0220385 L5.16236174,8.93507221 Z M15,20 C15,21.6568542 13.6568542,23 12,23 C10.3431458,23 9,21.6568542 9,20 L10.5,20 C10.5,20.8284271 11.1715729,21.5 12,21.5 C12.8284271,21.5 13.5,20.8284271 13.5,20 L15,20 Z" fillRule="nonzero" />
                  <circle cx="12" cy="3" r="2" />
                </svg>
              </div>
              <h3 className="text-lg font-heading text-gray-900">Notifications</h3>
            </div>
            <div className="space-y-5">
              {isNotificationsLoading ? (
                // Loading state - show skeleton only
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-200 animate-pulse mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                        <div className="h-2 bg-gray-100 rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                // API notifications
                notifications.slice(0, 4).map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 group">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFC11E] mt-1.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-body text-gray-900 leading-relaxed group-hover:text-gray-700 transition-colors duration-200">
                        {notification.msg}
                      </p>
                      <p className="text-xs font-caption text-gray-500 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                // No notifications message when API returns empty or fails
                <div className="text-center py-4">
                  <div className="text-gray-400 text-2xl mb-2">🔔</div>
                  <p className="text-gray-500 text-sm">No notifications available</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-heading text-gray-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.actionKey)}
                  className={`${action.color} p-3 rounded-xl flex flex-col items-center space-y-2 transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-1 group cursor-pointer`}
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-caption font-medium">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div id="analytics-charts" className="space-y-5">

          {/* Company Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-5">
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-heading text-gray-900">Company Trends</h3>
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-caption text-gray-600">Filter:</label>
                  <select
                    value={trendFilter}
                    onChange={(e) => setTrendFilter(e.target.value)}
                    className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              </div>
              <div className="cursor-pointer">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={filteredTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="companies" stroke="#FFCB44" strokeWidth={2} name="Companies" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue ($)" />
                </LineChart>
              </ResponsiveContainer>
              </div>
            </div>
          </div>


          {/* Company Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-heading text-gray-900">Company Performance</h3>
              <div className="flex items-center space-x-2">
                <label className="text-xs font-caption text-gray-600">Filter:</label>
                <select
                  value={performanceFilter}
                  onChange={(e) => setPerformanceFilter(e.target.value as PerformanceFilter)}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  disabled={isPerformanceLoading}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            {isPerformanceLoading ? (
              <div className="flex items-center justify-center h-80">
                <div className="flex flex-col items-center space-y-2">
                  <svg className="animate-spin h-8 w-8 text-[#FFC11E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-gray-500">Loading company performance...</p>
                </div>
              </div>
            ) : (
              <div className="cursor-pointer">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={companyPerformanceData.length > 0 ? companyPerformanceData : filteredPerformanceData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={companyPerformanceData.length > 0 ? "companyName" : "name"} 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rides" fill="#FFCB44" name="Rides Completed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Company Modal */}
      <AddCompanyModal
        isOpen={isAddCompanyModalOpen}
        onClose={() => setIsAddCompanyModalOpen(false)}
        onAddCompany={handleAddCompany}
      />

    </div>
  );
};

export default Dashboard;

