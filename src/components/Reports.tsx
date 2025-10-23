import { useState, useRef, useEffect } from 'react';

const DownloadIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>;
const ChevronDownIcon = () => <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>;

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

const CustomDropdown = ({ options, value, onChange, placeholder, className = "" }: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black text-left flex items-center justify-between text-xs cursor-pointer"
      >
        <span>{value || placeholder}</span>
        <ChevronDownIcon />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => { onChange(option); setIsOpen(false); }}
              className={`w-full px-2 py-1.5 text-left hover:bg-yellow-100 focus:bg-yellow-100 focus:outline-none cursor-pointer ${
                value === option ? 'bg-yellow-100' : 'bg-white'
              } text-black text-xs`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Reports = () => {
  const [reportType, setReportType] = useState('Leaderboard Report');
  const [selectedMonth, setSelectedMonth] = useState('September 2025');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sortBy, setSortBy] = useState('generated');
  const [sortOrder, setSortOrder] = useState('desc');
  const [typeFilter, setTypeFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('newest');

  const reportTypes = ['Leaderboard Report', 'Oxygen Safe Report', 'Annual Summary Report', 'Employee Analytics Report'];
  const months = ['January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025', 'July 2025', 'August 2025', 'September 2025', 'October 2025', 'November 2025', 'December 2025'];

  const dummyReports = [
    {
      id: 1,
      report: 'Leaderboard Report',
      period: 'September 2025',
      generated: '2025-09-20',
      status: 'Completed',
      actions: 'Download'
    },
    {
      id: 2,
      report: 'Oxygen Safe Report',
      period: 'Q3 2025',
      generated: '2025-09-18',
      status: 'Completed',
      actions: 'Download'
    },
    {
      id: 3,
      report: 'Annual Summary Report',
      period: '2024',
      generated: '2025-01-15',
      status: 'Completed',
      actions: 'Download'
    },
    {
      id: 4,
      report: 'Employee Analytics Report',
      period: 'August 2025',
      generated: '2025-08-30',
      status: 'Processing',
      actions: 'View'
    },
    {
      id: 5,
      report: 'Leaderboard Report',
      period: 'August 2025',
      generated: '2025-08-15',
      status: 'Completed',
      actions: 'Download'
    },
    {
      id: 6,
      report: 'Oxygen Safe Report',
      period: 'Q2 2025',
      generated: '2025-07-10',
      status: 'Failed',
      actions: 'Retry'
    }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setTimeout(() => { setIsGenerating(false); console.log('Generating report:', { reportType, selectedMonth }); }, 2000);
  };

  const handleSort = (column: string) => {
    setSortBy(column);
    setSortOrder(sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc');
    // Reset dropdown sort when clicking table headers
    setSortFilter('');
  };

  const clearFilters = () => {
    setTypeFilter('');
    setPeriodFilter('');
    setSortFilter('newest');
    setSortBy('generated');
    setSortOrder('desc');
  };

  const filteredAndSortedReports = [...dummyReports]
    .filter(report => {
      const typeMatch = !typeFilter || report.report === typeFilter;
      const periodMatch = !periodFilter || report.period.toLowerCase().includes(periodFilter.toLowerCase());
      return typeMatch && periodMatch;
    })
    .sort((a, b) => {
      // Apply dropdown sort filter first
      let sortColumn = sortBy;
      let sortDirection = sortOrder;
      
      switch (sortFilter) {
        case 'newest':
          sortColumn = 'generated';
          sortDirection = 'desc';
          break;
        case 'oldest':
          sortColumn = 'generated';
          sortDirection = 'asc';
          break;
        case 'name':
          sortColumn = 'report';
          sortDirection = 'asc';
          break;
        case 'period':
          sortColumn = 'period';
          sortDirection = 'asc';
          break;
      }

      const getValue = (report: any) => {
        switch (sortColumn) {
          case 'report': return report.report.toLowerCase();
          case 'period': return report.period.toLowerCase();
          case 'generated': return new Date(report.generated).getTime();
          case 'status': return report.status.toLowerCase();
          default: return report.generated;
        }
      };
      const aVal = getValue(a), bVal = getValue(b);
      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

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

  const cardData = [
    { title: 'Total Rides', value: '1', subtitle: 'This month', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', bg: 'bg-[#FFEECC]', text: 'text-[#FFC11E]' },
    { title: 'Safety Score', value: '98%', subtitle: 'Outstanding', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', bg: 'bg-green-100', text: 'text-green-600' },
    { title: 'Cost Savings', value: '$45', subtitle: '+12% from last month', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z', bg: 'bg-blue-100', text: 'text-blue-600' },
    { title: 'Completion Rate', value: '100.0%', subtitle: 'Perfect score', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-purple-100', text: 'text-purple-600' }
  ];

  return (
    <div className="flex-1 min-h-screen">
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Report Preview - 2025 09</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {cardData.map((card, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-all duration-200 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                  </div>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${card.bg} rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${card.text}`} fill="currentColor" viewBox="0 0 24 24"><path d={card.icon} /></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Generate New Report</h2>
          <div className="flex flex-col lg:flex-row lg:items-end space-y-3 lg:space-y-0 lg:space-x-3">
            <div className="flex-1 w-full lg:w-auto">
              <label className="block text-xs font-medium text-gray-700 mb-1.5 text-xs">Report Type</label>
              <CustomDropdown options={reportTypes} value={reportType} onChange={setReportType} placeholder="Select report type" />
            </div>
            <div className="flex-1 w-full lg:w-auto">
              <label className="block text-xs font-medium text-gray-700 mb-1.5 text-xs">Month</label>
              <CustomDropdown options={months} value={selectedMonth} onChange={setSelectedMonth} placeholder="Select month" />
            </div>
            <div className="w-full lg:w-auto">
              <button onClick={handleGenerateReport} disabled={isGenerating} className="w-full lg:w-auto bg-[#FFC11E] text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-[#FFC11E] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5 transition-colors text-xs sm:text-sm cursor-pointer">
                <DownloadIcon />
                <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 lg:mb-0">Previous Reports</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3">
              <button 
                onClick={clearFilters}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full sm:w-auto px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black text-xs cursor-pointer"
              >
                <option value="">All Report Types</option>
                {reportTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <select 
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="w-full sm:w-auto px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black text-xs cursor-pointer"
              >
                <option value="">All Periods</option>
                {months.map(month => <option key={month} value={month}>{month}</option>)}
              </select>
              <select 
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="w-full sm:w-auto px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black text-xs cursor-pointer"
              >
                <option value="newest">Sort by: Newest First</option>
                <option value="oldest">Sort by: Oldest First</option>
                <option value="name">Sort by: Report Name</option>
                <option value="period">Sort by: Period</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  {['report', 'period', 'generated', 'status', 'actions'].map((col, i) => (
                    <th 
                      key={col}
                      className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => col !== 'actions' && handleSort(col)}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="hidden sm:inline">{['Report', 'Period', 'Generated', 'Status', 'Actions'][i]}</span>
                        <span className="sm:hidden">{['Report', 'Period', 'Date', 'Status', 'Actions'][i]}</span>
                        {col !== 'actions' && <SortIcon column={col} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{report.report}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{report.period}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{new Date(report.generated).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        report.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'Failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <button className="text-xs sm:text-sm text-[#FFC11E] hover:text-[#E6B800] font-medium transition-colors cursor-pointer">
                        {report.actions}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
              <p className="text-xs sm:text-sm text-gray-700">
                Showing <span className="font-medium">{filteredAndSortedReports.length}</span> of <span className="font-medium">{dummyReports.length}</span> reports
              </p>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  Previous
                </button>
                <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-[#FFC11E] text-black rounded">1</span>
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
