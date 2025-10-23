import { useState, useMemo } from 'react';
import { Modal } from 'antd';
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
import type { Company } from '../data/companyData';
import { PlusIcon, CalendarIcon, SettingsIcon, DownloadIcon } from '../components/icons/DashboardIcons';
import { LeaderboardIcon } from '../data/icons/SidebarIcons';

interface CompanyDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

const CompanyDashboardModal = ({ isOpen, onClose, company }: CompanyDashboardModalProps) => {
  // Filter states for both charts
  const [trendFilter, setTrendFilter] = useState('week');
  const [performanceFilter, setPerformanceFilter] = useState('week');

  // Custom dashboard metrics for company dashboard modal
  const companyDashboardMetrics = [
    {
      title: 'Total Employees',
      value: '3',
      change: '+12% vs last month',
      changeType: 'positive',
      icon: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconColor: 'text-blue-500'
    },
    {
      title: 'Active Rides',
      value: '0',
      change: '+5 vs yesterday',
      changeType: 'positive',
      icon: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      iconColor: 'text-green-500'
    },
    {
      title: 'Monthly Rides',
      value: '1',
      change: '+18% vs last month',
      changeType: 'positive',
      icon: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      iconColor: 'text-yellow-500'
    },
    {
      title: 'Oxygen Save',
      value: '45 Kgs',
      change: '+24% vs last month',
      changeType: 'positive',
      icon: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      iconColor: 'text-green-500'
    }
  ];

  // Custom recent activities for company dashboard modal (driver and passenger focused)
  const companyRecentActivities = [
    {
      icon: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'Driver John Smith completed 5 rides today',
      subtitle: '2 hours ago'
    },
    {
      icon: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      title: 'New passenger Sarah Johnson joined the platform',
      subtitle: '3 hours ago'
    },
    {
      icon: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Driver Mike Chen received 5-star rating from passenger',
      subtitle: '4 hours ago'
    },
    {
      icon: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Passenger Emily Davis completed her 50th ride',
      subtitle: '6 hours ago'
    },
    {
      icon: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'Driver David Wilson earned $150 in tips today',
      subtitle: '8 hours ago'
    },
    {
      icon: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      title: 'Passenger Alex Brown scheduled 3 rides for tomorrow',
      subtitle: '10 hours ago'
    }
  ];

  // Handle quick action clicks
  const handleQuickAction = (actionKey: string) => {
    switch (actionKey) {
      case 'add-employee':
        // Handle add employee action
        console.log('Add Employee clicked');
        break;
      case 'leaderboard':
        // Handle leaderboard action
        console.log('Leaderboard clicked');
        break;
      case 'analytics':
        // Handle analytics action
        console.log('Analytics clicked');
        break;
      case 'settings':
        // Handle settings action
        console.log('Settings clicked');
        break;
      default:
        break;
    }
  };

  // Handle export data functionality
  const handleExportData = () => {
    // Create CSV data for export
    const csvData = [
      ['Metric', 'Value'],
      ['Total Employees', '156'],
      ['Active Rides', '156'],
      ['Monthly Rides', '4,250'],
      ['Oxygen Save', '2,100 kg']
    ];

    // Convert to CSV string
    const csvString = csvData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `company-dashboard-${company?.name || 'data'}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom quick actions for company dashboard modal
  const companyQuickActions = [
    { title: 'Add Employee', icon: PlusIcon, actionKey: 'add-employee', color: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900' },
    { title: 'Leaderboard', icon: LeaderboardIcon, actionKey: 'leaderboard', color: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900' },
    { title: 'Analytics', icon: CalendarIcon, actionKey: 'analytics', color: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900' },
    { title: 'Settings', icon: SettingsIcon, actionKey: 'settings', color: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900' }
  ];

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
        return [
          { name: 'Mon', companies: 8, revenue: 8500 },
          { name: 'Tue', companies: 12, revenue: 12800 },
          { name: 'Wed', companies: 15, revenue: 15200 },
          { name: 'Thu', companies: 18, revenue: 18500 },
          { name: 'Fri', companies: 22, revenue: 22100 },
          { name: 'Sat', companies: 19, revenue: 19800 },
          { name: 'Sun', companies: 16, revenue: 16800 }
        ];
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
        return [
          { name: 'Mon', companies: 8, revenue: 8500 },
          { name: 'Tue', companies: 12, revenue: 12800 },
          { name: 'Wed', companies: 15, revenue: 15200 },
          { name: 'Thu', companies: 18, revenue: 18500 },
          { name: 'Fri', companies: 22, revenue: 22100 },
          { name: 'Sat', companies: 19, revenue: 19800 },
          { name: 'Sun', companies: 16, revenue: 16800 }
        ];
    }
  };

  const generatePerformanceData = (period: string) => {
    switch (period) {
      case 'day':
        return [
          { name: 'Morning', rides: 45 },
          { name: 'Afternoon', rides: 78 },
          { name: 'Evening', rides: 92 },
          { name: 'Night', rides: 34 }
        ];
      case 'week':
        return [
          { name: company?.name || 'Company', rides: 1250, rating: 4.8 },
          { name: 'Industry Avg', rides: 980, rating: 4.2 },
          { name: 'Top Performer', rides: 1500, rating: 4.9 }
        ];
      case 'month':
        return [
          { name: 'Week 1', rides: 320 },
          { name: 'Week 2', rides: 450 },
          { name: 'Week 3', rides: 380 },
          { name: 'Week 4', rides: 520 }
        ];
      case 'year':
        return [
          { name: 'Q1', rides: 1200 },
          { name: 'Q2', rides: 1450 },
          { name: 'Q3', rides: 1380 },
          { name: 'Q4', rides: 1620 }
        ];
      default:
        return [
          { name: company?.name || 'Company', rides: 1250, rating: 4.8 },
          { name: 'Industry Avg', rides: 980, rating: 4.2 },
          { name: 'Top Performer', rides: 1500, rating: 4.9 }
        ];
    }
  };

  // Memoized filtered data
  const filteredTrendData = useMemo(() => generateCompanyTrendData(trendFilter), [trendFilter]);
  const filteredPerformanceData = useMemo(() => generatePerformanceData(performanceFilter), [performanceFilter]);

  if (!isOpen || !company) return null;

  return (
    <Modal
      title={
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{company.name} Dashboard</h2>
            <p className="text-sm text-gray-600">{company.industry} • {company.size} Company</p>
          </div>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width="90vw"
      style={{ maxWidth: '1400px' }}
      destroyOnHidden
    >

      {/* Modal Content - Dashboard Layout */}
      <div 
        className="p-5"
        style={{
          background: 'linear-gradient(150deg,rgb(255, 242, 188) 30%, #f3f4f6)',
          minHeight: '70vh',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {companyDashboardMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-caption mb-1 text-gray-600">{metric.title}</p>
                    <p className="text-xl font-display text-gray-900">{metric.value}</p>
                    <p className={`text-xs font-body ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </p>
                  </div>
                  <div className={`text-2xl ${metric.iconColor}`}>
                    <metric.icon />
                  </div>
                </div>
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
                {companyRecentActivities.slice(0, 4).map((activity, index) => {
                  return (
                    <div key={index} className="flex items-start space-x-3 group">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFC11E] mt-1.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-body text-gray-900 leading-relaxed group-hover:text-gray-700 transition-colors duration-200">{activity.title}</p>
                        <p className="text-xs font-caption text-gray-500 mt-1">{activity.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
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
                {companyQuickActions.map((action, index) => (
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
            {/* Company Trend Chart */}
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
                  <LineChart data={filteredTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="companies" stroke="#FFCB44" strokeWidth={2} name="Rides" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Employee Performance Chart */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-heading text-gray-900">Employee Performance</h3>
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-caption text-gray-600">Filter:</label>
                  <select
                    value={performanceFilter}
                    onChange={(e) => setPerformanceFilter(e.target.value)}
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
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={filteredPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rides" fill="#FFCB44" name="Rides Completed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Export Button at Bottom */}
        <div className="flex justify-center pt-6 pb-4 border-t border-gray-200">
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-6 py-3 bg-[#FFCB44] hover:bg-[#FFB800] text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <DownloadIcon className="w-5 h-5" />
            <span>Export Dashboard Data</span>
          </button>
        </div>
    </Modal>
  );
};

export default CompanyDashboardModal;
