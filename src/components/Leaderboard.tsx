import { useState, useEffect } from 'react';
import { getLeaderboard } from '../api/leaderboard/api';
import type { LeaderboardCompany, LeaderboardMetaData } from '../api/leaderboard/api';
import { customToast } from '../utils/useCustomToast';

const Leaderboard = () => {
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');
  const [industryFilter, setIndustryFilter] = useState('All Industries');
  const [searchTerm, setSearchTerm] = useState('');

  // API state
  const [apiCompanies, setApiCompanies] = useState<LeaderboardCompany[]>([]);
  const [metaData, setMetaData] = useState<LeaderboardMetaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Top performers state
  const [topPerformers, setTopPerformers] = useState<LeaderboardCompany[]>([]);
  const [isTopPerformersLoading, setIsTopPerformersLoading] = useState(false);

  // Fetch top performers data
  useEffect(() => {
    const fetchTopPerformers = async () => {
      try {
        setIsTopPerformersLoading(true);
        const params = {
          page: 1,
          limit: 3
        };
        
        const response = await getLeaderboard(params);
        
        if (response.hasError) {
          throw new Error(response.message || 'Failed to fetch top performers data');
        }
        
        setTopPerformers(response.data);
      } catch (error: any) {
        console.error('Failed to fetch top performers:', error);
        customToast.error(error.message || 'Failed to fetch top performers data');
        setTopPerformers([]);
      } finally {
        setIsTopPerformersLoading(false);
      }
    };

    fetchTopPerformers();
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const params = {
          page: currentPage,
          industryId: industryFilter === 'All Industries' ? undefined : getIndustryId(industryFilter),
          search: searchTerm || undefined
        };
        
        const response = await getLeaderboard(params);
        
        if (response.hasError) {
          throw new Error(response.message || 'Failed to fetch leaderboard data');
        }
        
        setApiCompanies(response.data);
        setMetaData(response.metaData);
      } catch (error: any) {
        console.error('Failed to fetch leaderboard:', error);
        customToast.error(error.message || 'Failed to fetch leaderboard data');
        setApiCompanies([]);
        setMetaData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentPage, industryFilter, searchTerm]);

  // Helper function to get industry ID from name
  const getIndustryId = (industryName: string): number => {
    const industryMap: { [key: string]: number } = {
      'Technology': 1,
      'Finance': 2,
      'Healthcare': 3,
      'Energy': 4,
      'Manufacturing': 5,
      'Retail': 6,
      'Education': 7
    };
    return industryMap[industryName] || 1;
  };


  // Helper function to generate initials from company name
  const generateInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get avatar color based on company name
  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-gray-500'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Convert API data to display format
  const displayCompanies = apiCompanies.map(company => ({
    id: company.id.toString(),
    name: company.name,
    initials: generateInitials(company.name),
    industry: company.industry,
    size: company.size as 'Small' | 'Medium' | 'Large' | 'Enterprise',
    rides: company.completedRides,
    score: company.score,
    rank: company.leaderboardRank,
    avatarColor: getAvatarColor(company.name),
    revenue: company.revenue,
    efficiency: company.efficiency
  }));

  // Use API data if available, otherwise show empty array (no fallback to static data)
  const companiesToShow = apiCompanies.length > 0 ? displayCompanies : [];

  const filteredCompanies = companiesToShow
    .filter(comp => (industryFilter === 'All Industries' || comp.industry === industryFilter) && 
                   comp.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const getValue = (comp: any) => {
        switch (sortBy) {
          case 'name': return comp.name.toLowerCase();
          case 'industry': return comp.industry.toLowerCase();
          case 'rides': return comp.rides;
          case 'score': return comp.score;
          case 'revenue': return comp.revenue;
          case 'efficiency': return comp.efficiency;
          default: return comp.rank;
        }
      };
      const aVal = getValue(a), bVal = getValue(b);
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

  const handleSort = (column: string) => {
    setSortBy(column);
    setSortOrder(sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleIndustryChange = (value: string) => {
    setIndustryFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const SortIcon = ({ column }: { column: string }) => {
    const isActive = sortBy === column;
    const isAsc = sortOrder === 'asc';
    const color = isActive ? 'text-gray-600' : 'text-gray-400';
    const path = isActive ? (isAsc ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7') : 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4';
    
    return (
      <svg className={`w-4 h-4 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
      </svg>
    );
  };

  return (
    <div className="flex-1 min-h-screen">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg p-8 mb-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Top Performers</h2>
            {isTopPerformersLoading ? (
              // Loading state for top performers
              <div className="flex justify-center items-end space-x-8">
                {[0, 1, 2].map((pos) => (
                  <div key={pos} className="flex flex-col items-center">
                    <div className="bg-gray-100 rounded-lg p-4 mb-4 shadow-sm border border-gray-200 animate-pulse">
                      <div className={`w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center`}></div>
                    </div>
                    <div className="text-center">
                      <div className="h-5 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : topPerformers.length > 0 ? (
              // API data for top performers - show companies based on available data
              <div className="flex justify-center items-end space-x-8">
                {(() => {
                  // Handle different numbers of companies
                  if (topPerformers.length === 1) {
                    // Single company - show in center
                    const company = topPerformers[0];
                    return (
                      <div key={company.id} className="flex flex-col items-center">
                        <div className="bg-gray-100 rounded-lg p-4 mb-4 shadow-sm border border-gray-200 transform scale-110">
                          <div className="w-20 h-20 text-2xl bg-[#FFC11E] text-black rounded-full flex items-center justify-center font-bold">
                            {generateInitials(company.name)}
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{company.name}</h3>
                          <p className="text-gray-600 text-sm">{company.completedRides} rides</p>
                          <p className="text-gray-500 text-xs">{company.revenue.toLocaleString()} points</p>
                        </div>
                      </div>
                    );
                  } else if (topPerformers.length === 2) {
                    // Two companies - show both
                    return topPerformers.map((company, index) => {
                      const isFirst = index === 0;
                      return (
                        <div key={company.id} className="flex flex-col items-center">
                          <div className={`bg-gray-100 rounded-lg p-4 mb-4 shadow-sm border border-gray-200 ${isFirst ? 'transform scale-110' : ''}`}>
                            <div className={`${isFirst ? 'w-20 h-20 text-2xl bg-[#FFC11E] text-black' : 'w-16 h-16 text-xl bg-gray-300 text-gray-600'} rounded-full flex items-center justify-center font-bold`}>
                              {generateInitials(company.name)}
                            </div>
                          </div>
                          <div className="text-center">
                            <h3 className={`${isFirst ? 'text-xl' : 'text-lg'} font-semibold text-gray-900 mb-1`}>{company.name}</h3>
                            <p className="text-gray-600 text-sm">{company.completedRides} rides</p>
                            <p className="text-gray-500 text-xs">{company.revenue.toLocaleString()} points</p>
                          </div>
                        </div>
                      );
                    });
                  } else {
                    // Three or more companies - show top 3 with reordering
                    return topPerformers.slice(0, 3).map((_, index) => {
                      // Reorder: 2nd, 1st, 3rd (so 1st appears in center)
                      const displayOrder = [1, 0, 2];
                      const actualIndex = displayOrder[index];
                      const companyToShow = topPerformers[actualIndex];
                      
                      // Skip if company data is undefined
                      if (!companyToShow) return null;
                      
                      const isFirst = actualIndex === 0;
                      
                      const displayCompany = {
                        id: companyToShow.id.toString(),
                        name: companyToShow.name,
                        initials: generateInitials(companyToShow.name),
                        industry: companyToShow.industry,
                        size: companyToShow.size as 'Small' | 'Medium' | 'Large' | 'Enterprise',
                        rides: companyToShow.completedRides,
                        score: companyToShow.score,
                        rank: companyToShow.leaderboardRank,
                        avatarColor: getAvatarColor(companyToShow.name),
                        revenue: companyToShow.revenue,
                        efficiency: companyToShow.efficiency
                      };
                      
                      return (
                        <div key={companyToShow.id} className="flex flex-col items-center">
                          <div className={`bg-gray-100 rounded-lg p-4 mb-4 shadow-sm border border-gray-200 ${isFirst ? 'transform scale-110' : ''}`}>
                            <div className={`${isFirst ? 'w-20 h-20 text-2xl bg-[#FFC11E] text-black' : 'w-16 h-16 text-xl bg-gray-300 text-gray-600'} rounded-full flex items-center justify-center font-bold`}>
                              {displayCompany.initials}
                            </div>
                          </div>
                          <div className="text-center">
                            <h3 className={`${isFirst ? 'text-xl' : 'text-lg'} font-semibold text-gray-900 mb-1`}>
                              {displayCompany.name}
                            </h3>
                            <p className="text-gray-600 text-sm">{displayCompany.rides} rides</p>
                            <p className="text-gray-500 text-xs">{displayCompany.revenue.toLocaleString()} points</p>
                          </div>
                        </div>
                      );
                    });
                  }
                })()}
              </div>
            ) : (
              // No data exists message
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Exists</h3>
                <p className="text-gray-500 text-sm">No companies found in the leaderboard</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-4 lg:space-y-0">
                <h2 className="text-xl font-semibold text-gray-900">Company Rankings</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black"
                  />
                  <select
                    value={industryFilter}
                    onChange={(e) => handleIndustryChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black cursor-pointer"
                  >
                    <option value="All Industries">All Industries</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Energy">Energy</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['rank', 'name', 'industry', 'rides', 'revenue', 'efficiency', 'score'].map((col, i) => (
                      <th 
                        key={col}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort(col)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{['Rank', 'Company', 'Industry', 'Rides', 'Revenue', 'Efficiency', 'Score'][i]}</span>
                          <SortIcon column={col} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    // Loading skeleton rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-4 bg-gray-200 rounded w-8"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="ml-4">
                              <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-8"></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-8"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredCompanies.length > 0 ? (
                    // API data rows
                    filteredCompanies.map((company, index) => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <span className="text-gray-900 font-semibold text-sm">#{company.rank || index + 1}</span>
                          {index < 3 && <div className="ml-2 w-2 h-2 bg-[#FFC11E] rounded-full"></div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm ${company.avatarColor}`}>
                            {company.initials}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{company.name}</div>
                            <div className="text-sm text-gray-500">{company.size} • {company.industry}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.industry === 'Technology' ? 'bg-blue-100 text-blue-800' :
                          company.industry === 'Finance' ? 'bg-green-100 text-green-800' :
                          company.industry === 'Healthcare' ? 'bg-red-100 text-red-800' :
                          company.industry === 'Energy' ? 'bg-yellow-100 text-yellow-800' :
                          company.industry === 'Manufacturing' ? 'bg-gray-100 text-gray-800' :
                          company.industry === 'Retail' ? 'bg-purple-100 text-purple-800' :
                          company.industry === 'Education' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {company.industry}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{company.rides.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">rides completed</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${company.revenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">total revenue</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${
                                company.efficiency >= 90 ? 'bg-green-500' : 
                                company.efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${company.efficiency}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{company.efficiency}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${
                                company.score >= 90 ? 'bg-green-500' : 
                                company.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${company.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{company.score}%</span>
                        </div>
                      </td>
                    </tr>
                    ))
                  ) : (
                    // No data message
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-gray-400 text-4xl mb-4">📊</div>
                        <p className="text-gray-500 text-lg">No companies found</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {isLoading ? (
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                  ) : metaData ? (
                    <>
                      Showing <span className="font-medium">{filteredCompanies.length}</span> of <span className="font-medium">{metaData.totalItems}</span> companies
                    </>
                  ) : (
                    <>
                      {filteredCompanies.length > 0 ? (
                        <>Showing <span className="font-medium">{filteredCompanies.length}</span> companies</>
                      ) : (
                        <>No companies available</>
                      )}
                    </>
                  )}
                </div>
                {metaData && (
                <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!metaData.previousPage || isLoading}
                      className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm bg-[#FFC11E] text-black rounded">
                      {currentPage}
                    </span>
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!metaData.nextPage || isLoading}
                      className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;