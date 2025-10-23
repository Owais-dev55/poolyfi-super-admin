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
  recentActivities,
  quickActions,
  ridesData
} from '../data/dashboardData';
import AddCompanyModal from './AddCompanyModal';
import { getNotifications } from '../api/notifications/api';
import type { Notification } from '../api/notifications/api';
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

  // Company Performance state
  const [companyPerformanceData, setCompanyPerformanceData] = useState<CompanyPerformanceData[]>([]);
  const [isPerformanceLoading, setIsPerformanceLoading] = useState(false);
  
  // Fallback mock data with proper structure
  const mockCompanyPerformance: CompanyPerformanceData[] = [
    { companyName: 'John Smith', rides: 45 },
    { companyName: 'Sarah Johnson', rides: 38 },
    { companyName: 'Mike Chen', rides: 42 },
    { companyName: 'Emily Davis', rides: 33 },
    { companyName: 'David Wilson', rides: 39 }
  ];

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsNotificationsLoading(true);
        const response = await getNotifications(5, 1);
        
        if (response.hasError) {
          throw new Error(response.message || 'Failed to fetch notifications');
        }
        
        setNotifications(response.data);
      } catch (error: any) {
        console.error('Failed to fetch notifications:', error);
        customToast.error(error.message || 'Failed to fetch notifications');
        // Keep using mock data as fallback
        setNotifications([]);
      } finally {
        setIsNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Fetch company performance data when filter changes
  useEffect(() => {
    const fetchCompanyPerformance = async () => {
      try {
        setIsPerformanceLoading(true);
        console.log('Fetching company performance with filter:', performanceFilter);
        const response = await getCompanyPerformance(performanceFilter);
        
        console.log('Company Performance API Response:', response);
        
        if (response.hasError) {
          throw new Error(response.message || 'Failed to fetch company performance data');
        }
        
        // Extract the nested data array from response.data.data
        const performanceData = response.data.data || [];
        console.log('Extracted performance data:', performanceData);
        setCompanyPerformanceData(performanceData);
      } catch (error: any) {
        console.error('Failed to fetch company performance:', error);
        customToast.error(error.message || 'Failed to fetch company performance data');
        // Keep using mock data as fallback
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
  const generateRidesData = (period: string) => {
    switch (period) {
      case 'day':
        return [
          { name: '12 AM', rides: 2 },
          { name: '3 AM', rides: 0 },
          { name: '6 AM', rides: 5 },
          { name: '9 AM', rides: 12 },
          { name: '12 PM', rides: 18 },
          { name: '3 PM', rides: 15 },
          { name: '6 PM', rides: 22 },
          { name: '9 PM', rides: 8 }
        ];
      case 'week':
        return ridesData; // Default weekly data
      case 'month':
        return [
          { name: 'Week 1', rides: 45 },
          { name: 'Week 2', rides: 52 },
          { name: 'Week 3', rides: 38 },
          { name: 'Week 4', rides: 61 }
        ];
      case 'year':
        return [
          { name: 'Jan', rides: 120 },
          { name: 'Feb', rides: 135 },
          { name: 'Mar', rides: 150 },
          { name: 'Apr', rides: 165 },
          { name: 'May', rides: 180 },
          { name: 'Jun', rides: 195 },
          { name: 'Jul', rides: 210 },
          { name: 'Aug', rides: 185 },
          { name: 'Sep', rides: 200 },
          { name: 'Oct', rides: 175 },
          { name: 'Nov', rides: 160 },
          { name: 'Dec', rides: 145 }
        ];
      default:
        return ridesData;
    }
  };

  // Memoized filtered data
  const filteredRidesData = useMemo(() => generateRidesData(trendFilter), [trendFilter]);

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
          {dashboardMetrics.map((metric, index) => (
             <div key={index} className={`${metric.title === 'Oxygen Save' ? 'bg-gradient-to-br from-yellow-500 to-yellow-300' : 'bg-white'} rounded-lg shadow-sm p-5 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <div>
                   <p className={`text-xs font-caption mb-1 ${metric.title === 'Oxygen Save' ? 'text-yellow-100' : 'text-gray-600'}`}>{metric.title}</p>
                   <p className={`text-xl font-display ${metric.title === 'Oxygen Save' ? 'text-white' : 'text-gray-900'}`}>{metric.value}</p>
                   <p className={`text-xs font-body ${metric.title === 'Oxygen Save' ? 'text-yellow-100' : (metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600')}`}>
                    {metric.change}
                  </p>
                </div>
                 <div className={`text-2xl ${metric.title === 'Oxygen Save' ? 'text-white relative z-10' : metric.iconColor}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
               {metric.title === 'Oxygen Save' && (
                 <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-200 opacity-40 rounded-full"></div>
               )}
            </div>
          ))}
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
                // Loading state
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
                // Fallback to mock data
                recentActivities.slice(0, 4).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFC11E] mt-1.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-body text-gray-900 leading-relaxed group-hover:text-gray-700 transition-colors duration-200">{activity.title}</p>
                      <p className="text-xs font-caption text-gray-500 mt-1">{activity.subtitle}</p>
                    </div>
                  </div>
                ))
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
        <div className="space-y-5">

          {/* Rides Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-5">
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-heading text-gray-900">Rides Trend</h3>
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
                <LineChart data={filteredRidesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rides" stroke="#FFCB44" strokeWidth={2} name="Rides" />
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
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={companyPerformanceData.length > 0 ? companyPerformanceData : mockCompanyPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="companyName" />
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
