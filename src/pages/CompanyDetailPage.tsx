import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyById } from '../api/company/api';
import { getCompanyEmployees } from '../api/user/api';
import { getSubAdminDashboardMeta, type SubAdminDashboardMetaData } from '../api/dashboard/api';
import type { CompanyEmployee } from '../api/user/api';
import { customToast } from '../utils/useCustomToast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { UsersIcon, RefreshIcon, CalendarIcon, OxygenIcon } from '../components/icons/DashboardIcons';

interface CompanyDetail {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  websiteUrl: string;
  industryId: number;
  sizeId: number;
  ownerId: number;
  approve: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  Department: any[];
  industry: {
    id: number;
    name: string;
  };
  size: {
    id: number;
    sizeText: string;
  };
  owner: {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    departmentId: null;
    companyId: number;
    isDelete: boolean;
    isActive: boolean;
    isRider: null;
    createdAt: string;
    updatedAt: string;
  };
}

const CompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Metrics state
  const [metricsData, setMetricsData] = useState<SubAdminDashboardMetaData | null>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!id) {
        setError('Company ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getCompanyById(parseInt(id));
        
        if (response.hasError) {
          throw new Error(response.message || 'Failed to fetch company details');
        }
        
        setCompany(response.data);
      } catch (err: any) {
        console.error('Failed to fetch company details:', err);
        setError(err.message || 'Failed to fetch company details');
        customToast.error(err.message || 'Failed to fetch company details');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCompanyEmployees = async () => {
      if (!id) return;

      try {
        setIsEmployeesLoading(true);
        const response = await getCompanyEmployees(parseInt(id));
        
        if (response.hasError) {
          throw new Error(response.message || 'Failed to fetch company employees');
        }
        
        setEmployees(response.data);
      } catch (err: any) {
        console.error('Failed to fetch company employees:', err);
        customToast.error(err.message || 'Failed to fetch company employees');
      } finally {
        setIsEmployeesLoading(false);
      }
    };

    const fetchMetricsData = async () => {
      if (!id) return;

      try {
        setIsMetricsLoading(true);
        setMetricsError(null);
        const response = await getSubAdminDashboardMeta(parseInt(id));
        
        if (response.hasError) {
          throw new Error(response.message || 'Failed to fetch metrics data');
        }
        
        setMetricsData(response.data);
      } catch (err: any) {
        console.error('Failed to fetch metrics data:', err);
        setMetricsError(err.message || 'Failed to fetch metrics data');
        // Don't show error toast for metrics as it's not critical
      } finally {
        setIsMetricsLoading(false);
      }
    };

    fetchCompanyDetails();
    fetchCompanyEmployees();
    fetchMetricsData();
  }, [id]);

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getApprovalColor = (approve: boolean) => {
    return approve ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   });
  // };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <Skeleton width={40} height={40} />
                <div>
                  <Skeleton width={200} height={24} />
                  <Skeleton width={120} height={16} />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton width={60} height={24} />
                <Skeleton width={80} height={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Company Information Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Skeleton */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Skeleton width={150} height={20} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Skeleton width={100} height={14} />
                    <Skeleton width={180} height={16} />
                  </div>
                  <div className="space-y-2">
                    <Skeleton width={80} height={14} />
                    <Skeleton width={200} height={16} />
                  </div>
                  <div className="space-y-2">
                    <Skeleton width={60} height={14} />
                    <Skeleton width={120} height={16} />
                  </div>
                  <div className="space-y-2">
                    <Skeleton width={80} height={14} />
                    <Skeleton width={150} height={16} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Skeleton width={70} height={14} />
                    <Skeleton width={250} height={16} />
                  </div>
                </div>
              </div>

              {/* Company Details Skeleton */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Skeleton width={120} height={20} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Skeleton width={70} height={14} />
                    <Skeleton width={60} height={20} />
                  </div>
                  <div className="space-y-2">
                    <Skeleton width={90} height={14} />
                    <Skeleton width={80} height={20} />
                  </div>
                </div>
              </div>

              {/* Owner Information Skeleton */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Skeleton width={140} height={20} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Skeleton width={90} height={14} />
                    <Skeleton width={150} height={16} />
                  </div>
                  <div className="space-y-2">
                    <Skeleton width={90} height={14} />
                    <Skeleton width={200} height={16} />
                  </div>
                  <div className="space-y-2">
                    <Skeleton width={90} height={14} />
                    <Skeleton width={120} height={16} />
                  </div>
                  <div className="space-y-2">
                    <Skeleton width={90} height={14} />
                    <Skeleton width={60} height={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              {/* Company ID & Dates Skeleton */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Skeleton width={180} height={20} />
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Skeleton width={80} height={14} />
                    <Skeleton width={60} height={16} />
                  </div>
                  <div className="space-y-2">
                    <Skeleton width={60} height={14} />
                    <Skeleton width={200} height={16} />
                  </div>
                  <div className="space-y-2">
                    <Skeleton width={90} height={14} />
                    <Skeleton width={200} height={16} />
                  </div>
                </div>
              </div>

              {/* Departments Skeleton */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Skeleton width={100} height={20} />
                <div className="space-y-2 mt-4">
                  <Skeleton width={120} height={40} />
                  <Skeleton width={100} height={40} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The company you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/companies')}
            className="bg-[#FFC11E] hover:bg-[#E6B800] text-black px-6 py-2 rounded-lg transition-colors"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/companies')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-sm text-gray-500">Company Details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(company.isActive)}`}>
                {company.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getApprovalColor(company.approve)}`}>
                {company.approve ? 'Approved' : 'Pending'}
              </span>
          </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {[
            {
              title: 'Active Employees',
              value: isMetricsLoading ? (
                <Skeleton height={24} width={60} baseColor="#e5e7eb" highlightColor="#f3f4f6" />
              ) : metricsError ? (
                <span className="text-red-500 text-sm">Error</span>
              ) : (
                metricsData?.activeEmployees?.toString() || '0'
              ),
              icon: UsersIcon,
              iconColor: 'text-blue-500'
            },
            {
              title: 'Active Rides',
              value: isMetricsLoading ? (
                <Skeleton height={24} width={60} baseColor="#e5e7eb" highlightColor="#f3f4f6" />
              ) : metricsError ? (
                <span className="text-red-500 text-sm">Error</span>
              ) : (
                metricsData?.activeRides?.toString() || '0'
              ),
              icon: RefreshIcon,
              iconColor: 'text-green-500'
            },
            {
              title: 'Monthly Rides',
              value: isMetricsLoading ? (
                <Skeleton height={24} width={60} baseColor="#e5e7eb" highlightColor="#f3f4f6" />
              ) : metricsError ? (
                <span className="text-red-500 text-sm">Error</span>
              ) : (
                metricsData?.monthlyRides?.toString() || '0'
              ),
              icon: CalendarIcon,
              iconColor: 'text-yellow-500'
            },
            {
              title: 'Oxygen Save',
              value: isMetricsLoading ? (
                <Skeleton height={24} width={60} baseColor="#fbbf24" highlightColor="#f59e0b" />
              ) : metricsError ? (
                <span className="text-red-500 text-sm">Error</span>
              ) : (
                metricsData?.oxygenSaved || '0 kgs'
              ),
              icon: OxygenIcon,
              iconColor: 'text-white'
            }
          ].map((metric, index) => (
            <div key={index} className={`${metric.title === 'Oxygen Save' ? 'bg-gradient-to-br from-yellow-500 to-yellow-300' : 'bg-white'} rounded-lg shadow-sm p-5 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-caption mb-1 ${metric.title === 'Oxygen Save' ? 'text-yellow-100' : 'text-gray-600'}`}>{metric.title}</p>
                  <div className={`text-xl font-display ${metric.title === 'Oxygen Save' ? 'text-white' : 'text-gray-900'}`}>
                    {metric.value}
                  </div>
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Name</label>
                  <p className="text-gray-900 font-medium">{company.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{company.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{company.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Website</label>
                  <p className="text-gray-900">
                    {company.websiteUrl ? (
                      <a 
                        href={company.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {company.websiteUrl}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Industry</label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {company.industry.name}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Size</label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {company.size.sizeText}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{company.address}</p>
                </div>
              </div>
            </div>

            {/* Owner Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Owner Name</label>
                  <p className="text-gray-900 font-medium">{company.owner.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Owner Email</label>
                  <p className="text-gray-900">{company.owner.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Owner Phone</label>
                  <p className="text-gray-900">{company.owner.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Owner Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(company.owner.isActive)}`}>
                      {company.owner.isActive ? 'Active' : 'Inactive'}
                    </span>
          </div>
        </div>
      </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company ID & Dates */}
            {/* 
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Company ID & Timeline</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Company ID</label>
                  <p className="text-gray-900 font-mono">#{company.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">{formatDate(company.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900">{formatDate(company.updatedAt)}</p>
                </div>
              </div>
            </div>
            */}

            {/* Departments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Departments</h2>
              {company.Department && company.Department.length > 0 ? (
                <div className="space-y-2">
                  {company.Department.map((dept: any, index: number) => (
                    <div key={index} className="p-2 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900">{dept.name || `Department ${index + 1}`}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No departments found</p>
              )}
            </div>
          </div>
        </div>

        {/* Company Employees - Full Width */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Company Employees</h2>
              <span className="text-sm text-gray-500">
                {isEmployeesLoading ? 'Loading...' : `${employees.length} employees`}
              </span>
            </div>
            
            {isEmployeesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <Skeleton width={40} height={40} circle />
                    <div className="flex-1">
                      <Skeleton width={150} height={16} />
                      <Skeleton width={200} height={14} />
                    </div>
                    <Skeleton width={60} height={20} />
                  </div>
                ))}
              </div>
            ) : employees.length > 0 ? (
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[#FFC11E] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {employee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                        <p className="text-sm text-gray-500">{employee.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {employee.isRider && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Rider
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.isActive)}`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">👥</div>
                <p className="text-gray-500">No employees found for this company</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailPage;