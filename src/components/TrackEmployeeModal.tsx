import React from 'react';
import { Modal, Input, Button } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';

interface Employee {
  id: string;
  name: string;
  role: string;
  status: string;
  lastUpdate: string;
  speed?: number;
  battery?: number;
}

interface TrackEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  searchInput: string;
  searchTerm: string;
  onSearchInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onEmployeeSelect: (employeeId: string) => void;
}

const TrackEmployeeModal = ({
  isOpen,
  onClose,
  employees,
  searchInput,
  searchTerm,
  onSearchInputChange,
  onSearch,
  onEmployeeSelect
}: TrackEmployeeModalProps) => {
  const handleCancel = () => {
    onClose();
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      title={
        <div className="flex items-center space-x-1.5">
          <UserOutlined className="text-blue-600 text-sm" />
          <span className="text-base">Track Active Employees</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={window.innerWidth < 640 ? '95%' : 600}
      destroyOnHidden
      className="track-employee-modal"
    >
      <div className="mt-3">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search employees..."
              value={searchInput}
              onChange={onSearchInputChange}
              onPressEnter={onSearch}
              prefix={<SearchOutlined className="text-gray-400" />}
              size="middle"
              className="flex-1"
            />
            <Button
              type="primary"
              onClick={onSearch}
              disabled={!searchInput.trim() || searchInput.trim() === searchTerm.trim()}
              size="middle"
              style={{ backgroundColor: '#FFC11E', borderColor: '#FFC11E', color: 'black' }}
            >
              Search
            </Button>
          </div>
        </div>

        {/* Employee List */}
        <div className="max-h-64 sm:max-h-96 overflow-y-auto">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="text-gray-400 text-xl sm:text-2xl mb-2">👥</div>
              <p className="text-xs sm:text-sm text-gray-500">No employees found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="p-2 sm:p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onEmployeeSelect(employee.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        employee.status === 'Active' ? 'bg-green-500' : 
                        employee.status === 'On Break' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{employee.name}</h3>
                          <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                            employee.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            employee.status === 'On Break' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {employee.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{employee.role}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs text-gray-500">{employee.lastUpdate}</p>
                      {employee.speed && employee.battery && (
                        <div className="flex space-x-2 text-xs text-gray-400 mt-1">
                          <span>{employee.speed}km/h</span>
                          <span>•</span>
                          <span>{employee.battery}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
            </p>
            <Button
              onClick={handleCancel}
              size="middle"
              className="px-6 text-sm"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TrackEmployeeModal;
