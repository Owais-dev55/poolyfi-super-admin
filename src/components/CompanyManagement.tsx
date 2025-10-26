import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCompanyModal from './AddCompanyModal';
import EditCompanyModal from './EditCompanyModal';
import DeleteCompanyModal from './DeleteCompanyModal';
import { customToast } from '../utils/useCustomToast';
import type { Company } from '../data/companyData';
import { mapApiCompanyToUI } from '../data/companyData';
import * as companyApi from '../api/company/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CompanyManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All Industries');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Companies meta data state
  const [companiesMeta, setCompaniesMeta] = useState<companyApi.CompaniesMetaData | null>(null);

  // Fetch companies meta data from API
  useEffect(() => {
    const fetchCompaniesMeta = async () => {
      try {
        const response = await companyApi.getCompaniesMeta();
        
        if (response.hasError) {
          throw new Error(response.message || 'Failed to fetch companies meta');
        }
        
        setCompaniesMeta(response.metaData);
      } catch (err: any) {
        console.error('Failed to fetch companies meta:', err);
        // Don't show error toast for meta data as it's not critical
      }
    };

    fetchCompaniesMeta();
  }, []);

  // Fetch companies from API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await companyApi.getCompanies();
        
        if (response.hasError) {
          throw new Error(response.message || 'Failed to fetch companies');
        }
        
        const mappedCompanies = response.data.map(mapApiCompanyToUI);
        setCompanies(mappedCompanies);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to load companies. Please try again.';
        setError(errorMessage);
        customToast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filter and sort companies
  const filteredCompanies = companies
    .filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) 
                        //  company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        //  company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === 'All Industries' || company.industry === industryFilter;
    return matchesSearch && matchesIndustry;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'industry':
          aValue = a.industry.toLowerCase();
          bValue = b.industry.toLowerCase();
          break;
        case 'size':
          aValue = a.size.toLowerCase();
          bValue = b.size.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, industryFilter]);

  // Calculate stats - use API meta data when available, fallback to local calculation
  const totalCompanies = companiesMeta?.activeCompanies ?? companies.length;
  const smallCompanies = companiesMeta?.sizes.find(size => size.sizeText === '1-50')?.count ?? 
                        companies.filter(comp => comp.size === 'Small').length;
  const mediumCompanies = companiesMeta?.sizes.find(size => size.sizeText === '51-200')?.count ?? 
                         companies.filter(comp => comp.size === 'Medium').length;
  const largeCompanies = companiesMeta?.sizes.find(size => size.sizeText === '200 above')?.count ?? 
                        companies.filter(comp => comp.size === 'Large').length;

  const handleAddCompany = async (_newCompanyData: any) => {
    // The AddCompanyModal already handles the API call and shows success message
    // We just need to refresh the companies list and meta data
    try {
      // Refresh companies list
      const response = await companyApi.getCompanies();
      
      if (response.hasError) {
        throw new Error(response.message || 'Failed to refresh companies list');
      }
      
      const mappedCompanies = response.data.map(mapApiCompanyToUI);
      setCompanies(mappedCompanies);

      // Refresh companies meta data
      try {
        const metaResponse = await companyApi.getCompaniesMeta();
        if (!metaResponse.hasError) {
          setCompaniesMeta(metaResponse.metaData);
        }
      } catch (metaErr) {
        console.error('Failed to refresh companies meta:', metaErr);
        // Don't show error for meta refresh failure
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to refresh companies list';
      customToast.error(errorMessage);
    }
  };

  const handleEditCompany = (companyId: string, updatedCompanyData: any) => {
    // Map sizeId to size text
    const sizeMap: Record<number, 'Small' | 'Medium' | 'Large' | 'Enterprise'> = {
      1: 'Small',
      2: 'Medium', 
      3: 'Large',
      4: 'Enterprise'
    };
    
    // Map industryId to industry name
    const industryMap: Record<number, string> = {
      1: 'IT',
      2: 'Healthcare',
      3: 'Finance',
      4: 'Education',
      5: 'Construction',
      6: 'Retail',
      7: 'Transport',
      8: 'Energy',
      9: 'Manufacturing',
      10: 'Media'
    };
    
    const sizeText = sizeMap[updatedCompanyData.sizeId] || 'Small';
    const industryName = industryMap[updatedCompanyData.industryId] || 'Unknown';
    
    setCompanies(prev => prev.map(comp => 
      comp.id === companyId 
        ? {
            ...comp,
            name: updatedCompanyData.companyName,
            address: updatedCompanyData.address,
            email: updatedCompanyData.email,
            industry: industryName,
            industryId: updatedCompanyData.industryId,
            size: sizeText,
            sizeId: updatedCompanyData.sizeId,
            phoneNumber: updatedCompanyData.phoneNumber,
            website: updatedCompanyData.website,
            avatar: updatedCompanyData.companyName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
          }
        : comp
    ));
    customToast.success('Company Updated! Company information has been successfully updated.');
  };

  const handleEditClick = (company: Company) => {
    setSelectedCompany(company);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteModalOpen(true);
  };

  const handleViewClick = (company: Company) => {
    navigate(`/company/${company.id}`);
  };

  const handleStatusToggle = async (company: Company) => {
    const newStatus = company.status === 'Active' ? 'Inactive' : 'Active';
    const isActive = newStatus === 'Active';
    
    try {
      const response = await companyApi.updateCompanyStatus(parseInt(company.id), isActive);
      
      if (response.hasError) {
        throw new Error(response.message || 'Failed to update company status');
      }
      
      // Update the company status in the local state
      setCompanies(prev => prev.map(comp => 
        comp.id === company.id 
          ? { ...comp, status: newStatus }
          : comp
      ));
      
      const statusMessage = newStatus === 'Active' ? 'made active' : 'made inactive';
      const toastMessage = response.message || `Company has been ${statusMessage}!`;
      console.log('Status toggle success:', { companyName: company.name, newStatus, toastMessage });
      customToast.success(toastMessage);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update company status. Please try again.';
      customToast.error(errorMessage);
    }
  };

  const handleDeleteCompany = async (_companyId: string) => {
    // The DeleteCompanyModal already handles the API call and shows success message
    // We just need to refresh the companies list and meta data
    try {
      // Refresh companies list
      const response = await companyApi.getCompanies();
      
      if (response.hasError) {
        throw new Error(response.message || 'Failed to refresh companies list');
      }
      
      const mappedCompanies = response.data.map(mapApiCompanyToUI);
      setCompanies(mappedCompanies);

      // Refresh companies meta data
      try {
        const metaResponse = await companyApi.getCompaniesMeta();
        if (!metaResponse.hasError) {
          setCompaniesMeta(metaResponse.metaData);
        }
      } catch (metaErr) {
        console.error('Failed to refresh companies meta:', metaErr);
        // Don't show error for meta refresh failure
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to refresh companies list';
      customToast.error(errorMessage);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen">
        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Company Overview Section Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-5">
                <Skeleton width={150} height={24} />
                <Skeleton width={120} height={36} />
              </div>

              {/* Summary Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton width={80} height={12} />
                        <Skeleton width={40} height={20} className="mt-1" />
                        <Skeleton width={60} height={12} className="mt-1" />
                      </div>
                      <Skeleton width={40} height={40} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section Skeleton */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Table Header with Filters Skeleton */}
              <div className="px-5 py-3 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3 space-y-3 lg:space-y-0">
                  <Skeleton width={120} height={24} />
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <Skeleton width={200} height={32} />
                    <Skeleton width={120} height={32} />
                    <Skeleton width={80} height={32} />
                  </div>
                </div>
              </div>

              {/* Table Header Skeleton */}
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-5 gap-4">
                  <Skeleton width={80} height={16} />
                  <Skeleton width={60} height={16} />
                  <Skeleton width={50} height={16} />
                  <Skeleton width={60} height={16} />
                  <Skeleton width={70} height={16} />
                </div>
              </div>

              {/* Table Rows Skeleton */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-5 py-3 border-b border-gray-200">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    {/* Company Column */}
                    <div className="flex items-center space-x-3">
                      <Skeleton width={32} height={32} circle />
                      <div>
                        <Skeleton width={120} height={16} />
                        <Skeleton width={180} height={12} className="mt-1" />
                      </div>
                    </div>
                    
                    {/* Industry Column */}
                    <Skeleton width={60} height={20} />
                    
                    {/* Size Column */}
                    <Skeleton width={50} height={16} />
                    
                    {/* Status Column */}
                    <Skeleton width={50} height={24} />
                    
                    {/* Actions Column */}
                    <div className="flex space-x-2">
                      <Skeleton width={28} height={28} />
                      <Skeleton width={28} height={28} />
                      <Skeleton width={28} height={28} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between mt-6">
              <Skeleton width={150} height={16} />
              <div className="flex items-center space-x-2">
                <Skeleton width={60} height={32} />
                <Skeleton width={32} height={32} />
                <Skeleton width={60} height={32} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Companies</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#FFC11E] hover:bg-[#E6B800] text-black px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen">
      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Company Overview Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 lg:mb-0">Company Overview</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
                className="bg-[#FFC11E] hover:bg-[#E6B800] text-black px-4 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors w-full lg:w-auto justify-center text-sm cursor-pointer"
          >
            <span className="text-lg">+</span>
            <span>Add Company</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-0.5">Total Companies</p>
                <p className="text-lg font-bold text-gray-900">{totalCompanies}</p>
                    <p className="text-xs text-gray-500">In system</p>
              </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-0.5">Small Companies</p>
                <p className="text-lg font-bold text-gray-900">{smallCompanies}</p>
                    <p className="text-xs text-gray-500">1-50 employees</p>
              </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
            </div>
          </div>

              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-0.5">Medium Companies</p>
                <p className="text-lg font-bold text-gray-900">{mediumCompanies}</p>
                    <p className="text-xs text-gray-500">51-200 employees</p>
              </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-0.5">Large Companies</p>
                <p className="text-lg font-bold text-gray-900">{largeCompanies}</p>
                    <p className="text-xs text-gray-500">200+ employees</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header with Filters */}
          <div className="px-5 py-3 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3 space-y-3 lg:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900">All Companies</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black"
              />
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black cursor-pointer"
                >
                  <option value="All Industries">All Industries</option>
                  <option value="IT">IT</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Construction">Construction</option>
                  <option value="Retail">Retail</option>
                  <option value="Transport">Transport</option>
                  <option value="Energy">Energy</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Media">Media</option>
                </select>
              <button className="bg-[#FFC11E] text-black px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#E6B800] transition-colors flex items-center space-x-1.5 cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export</span>
              </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                <th 
                  className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Company</span>
                    <SortIcon column="name" />
                  </div>
                </th>
                <th 
                  className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('industry')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Industry</span>
                    <SortIcon column="industry" />
                  </div>
                </th>
                <th 
                  className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('size')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Size</span>
                    <SortIcon column="size" />
                  </div>
                </th>
                <th 
                  className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <SortIcon column="status" />
                  </div>
                </th>
                <th 
                  className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date Added</span>
                    <SortIcon column="createdAt" />
                  </div>
                </th>
                  <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xs shadow-sm">
                          {company.avatar}
                        </div>
                        <div className="ml-3">
                          <div className="text-xs font-medium text-gray-900">{company.name}</div>
                          <div className="text-xs text-gray-500">{company.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.industry === 'IT' 
                        ? 'bg-blue-100 text-blue-800' 
                        : company.industry === 'Finance'
                        ? 'bg-green-100 text-green-800'
                        : company.industry === 'Healthcare'
                        ? 'bg-red-100 text-red-800'
                        : company.industry === 'Education'
                        ? 'bg-purple-100 text-purple-800'
                        : company.industry === 'Construction'
                        ? 'bg-orange-100 text-orange-800'
                        : company.industry === 'Retail'
                        ? 'bg-pink-100 text-pink-800'
                        : company.industry === 'Transport'
                        ? 'bg-indigo-100 text-indigo-800'
                        : company.industry === 'Energy'
                        ? 'bg-yellow-100 text-yellow-800'
                        : company.industry === 'Manufacturing'
                        ? 'bg-cyan-100 text-cyan-800'
                        : company.industry === 'Media'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                        {company.industry}
                      </span>
                    </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="text-xs font-medium text-gray-900">{company.size}</div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={company.status === 'Active'}
                          onChange={() => handleStatusToggle(company)}
                          className="sr-only peer"
                          disabled={false} // You can add loading state here if needed
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500`}></div>
                        <span className={`ml-3 text-xs font-medium ${
                          company.status === 'Active' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {company.status}
                        </span>
                      </label>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        {new Date(company.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewClick(company)}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          title="View Company"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleEditClick(company)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Company"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(company)}
                          className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Company"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, filteredCompanies.length)}</span> of <span className="font-medium">{filteredCompanies.length}</span> companies
              </p>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2 py-1 text-xs rounded ${
                      currentPage === pageNum
                        ? 'bg-[#FFC11E] text-black'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Add Company Modal */}
      <AddCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCompany={handleAddCompany}
      />

      {/* Edit Company Modal */}
      <EditCompanyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCompany(null);
        }}
        onEditCompany={handleEditCompany}
        company={selectedCompany}
      />

      {/* Delete Company Modal */}
      <DeleteCompanyModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCompany(null);
        }}
        onDeleteCompany={handleDeleteCompany}
        company={selectedCompany}
      />


    </div>
  );
};

export default CompanyManagement;
