// Dashboard page data
import { UsersIcon, RefreshIcon, CalendarIcon, CashIcon, PlusIcon, SettingsIcon, CheckIcon } from '../components/icons/DashboardIcons';
import { LeaderboardIcon } from '../data/icons/SidebarIcons';

export const dashboardMetrics = [
  {
    title: 'Total Companies',
    value: '8',
    change: '+25% vs last month',
    changeType: 'positive',
    icon: UsersIcon,
    iconColor: 'text-blue-500'
  },
  {
    title: 'Active Rides',
    value: '156',
    change: '+12 vs yesterday',
    changeType: 'positive',
    icon: RefreshIcon,
    iconColor: 'text-green-500'
  },
  {
    title: 'Monthly Rides',
    value: '4,250',
    change: '+18% vs last month',
    changeType: 'positive',
    icon: CalendarIcon,
    iconColor: 'text-yellow-500'
  },
  {
    title: 'Revenue Generated',
    value: '$85,000',
    change: '+24% vs last month',
    changeType: 'positive',
    icon: CashIcon,
    iconColor: 'text-green-500'
  }
];

export const recentActivities = [
  {
    icon: CheckIcon,
    title: 'Company "TechCorp Solutions" was verified',
    subtitle: '3 hours ago',
    iconColor: 'text-blue-500'
  },
  {
    icon: UsersIcon,
    title: 'Company "Green Energy Co" completed 50 rides',
    subtitle: '4 hours ago',
    iconColor: 'text-green-500'
  },
  {
    icon: CashIcon,
    title: 'Company "Finance First" generated $5,000 revenue',
    subtitle: '8 hours ago',
    iconColor: 'text-yellow-500'
  },
  {
    icon: UsersIcon,
    title: 'New company "HealthTech Innovations" joined',
    subtitle: '2 hours ago',
    iconColor: 'text-green-500'
  },
  {
    icon: UsersIcon,
    title: 'Company "RetailMax" reached 100 rides milestone',
    subtitle: '4 hours ago',
    iconColor: 'text-blue-500'
  },
  {
    icon: CheckIcon,
    title: 'Company "EduTech Systems" was verified',
    subtitle: '6 hours ago',
    iconColor: 'text-blue-500'
  }
];

export const quickActions = [
  { title: 'Add Company', icon: PlusIcon, actionKey: 'add-company', color: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900' },
  { title: 'Leaderboard', icon: LeaderboardIcon, actionKey: 'leaderboard', color: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900' },
  { title: 'Analytics', icon: CalendarIcon, actionKey: 'analytics', color: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900' },
  { title: 'Settings', icon: SettingsIcon, actionKey: 'settings', color: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900' }
];

// Chart data
export const ridesData = [
  { name: 'Mon', rides: 12, revenue: 240 },
  { name: 'Tue', rides: 19, revenue: 380 },
  { name: 'Wed', rides: 15, revenue: 300 },
  { name: 'Thu', rides: 25, revenue: 500 },
  { name: 'Fri', rides: 22, revenue: 440 },
  { name: 'Sat', rides: 18, revenue: 360 },
  { name: 'Sun', rides: 14, revenue: 280 }
];

export const employeePerformance = [
  { name: 'John Smith', rides: 45, rating: 4.8 },
  { name: 'Sarah Johnson', rides: 37, rating: 4.9 },
  { name: 'Mike Chen', rides: 42, rating: 4.7 },
  { name: 'Emily Davis', rides: 33, rating: 4.6 },
  { name: 'David Wilson', rides: 38, rating: 4.8 }
];

export const rideTypesData = [
  { name: 'Business', value: 45, color: '#FFCB44' },
  { name: 'Personal', value: 30, color: '#10B981' },
  { name: 'Airport', value: 15, color: '#F59E0B' },
  { name: 'Other', value: 10, color: '#EF4444' }
];

export const monthlyTrends = [
  { month: 'Jan', rides: 120, cost: 2400 },
  { month: 'Feb', rides: 135, cost: 2200 },
  { month: 'Mar', rides: 150, cost: 2100 },
  { month: 'Apr', rides: 165, cost: 2000 },
  { month: 'May', rides: 180, cost: 1900 },
  { month: 'Jun', rides: 195, cost: 1850 }
];
