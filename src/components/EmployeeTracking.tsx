import React, { useState, useEffect, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import TrackEmployeeModal from './TrackEmployeeModal';
import type { EmployeeLocation } from '../data/trackingData';

interface Employee extends EmployeeLocation {
  speed?: number;
  direction?: string;
  battery?: number;
}

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyDvog6BMI8O8OXfseD3HV5x-X2Q8uo2ytU';

// Simplified icons
const Icon = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);

// Google Maps component
const MapComponent = ({ 
  employees, 
  selectedEmployee, 
  onEmployeeSelect 
}: { 
  employees: Employee[];
  selectedEmployee: string | null;
  onEmployeeSelect: (id: string | null) => void;
}) => {
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  const mapRef = useCallback((node: HTMLDivElement) => {
    if (node !== null && map === null && window.google) {
      console.log('Creating Google Map for mobile/tablet');
      const newMap = new window.google.maps.Map(node, {
        center: { lat: 40.7128, lng: -74.0060 }, // New York City
        zoom: 12,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [map]);

  // Create custom markers for employees
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Only show marker for selected employee
    const employeesToShow = selectedEmployee 
      ? employees.filter(emp => emp.id === selectedEmployee)
      : [];

    const newMarkers = employeesToShow.map(employee => {
      const statusIcon = employee.status === 'Active' ? '🟢' : 
                        employee.status === 'On Break' ? '🟡' : '⚫';
      
      const marker = new window.google.maps.Marker({
        position: { lat: employee.lat, lng: employee.lng },
        map: map,
        title: `${employee.name} - ${employee.role}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: employee.color.replace('bg-', '').replace('-500', ''),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        label: {
          text: statusIcon,
          fontSize: '12px',
          color: '#000000'
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        onEmployeeSelect(selectedEmployee === employee.id ? null : employee.id);
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${employee.name}</h3>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${employee.role}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px;">
              Status: <span style="color: ${employee.status === 'Active' ? '#10b981' : 
                                      employee.status === 'On Break' ? '#f59e0b' : '#6b7280'}; font-weight: 500;">
                ${employee.status}
              </span>
            </p>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">Last update: ${employee.lastUpdate}</p>
            ${employee.speed ? `<p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">Speed: ${employee.speed} km/h</p>` : ''}
            ${employee.battery ? `<p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">Battery: ${employee.battery}%</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onEmployeeSelect(selectedEmployee === employee.id ? null : employee.id);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit bounds to show selected employee or center on NYC if none selected
    if (employeesToShow.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      employeesToShow.forEach(emp => bounds.extend({ lat: emp.lat, lng: emp.lng }));
      map.fitBounds(bounds);
    } else if (!selectedEmployee) {
      // Center on NYC when no employee is selected
      map.setCenter({ lat: 40.7128, lng: -74.0060 });
      map.setZoom(12);
    }
  }, [map, employees, selectedEmployee, onEmployeeSelect]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

// Loading component
const MapLoading = () => (
  <div className="flex items-center justify-center h-full bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-600 text-sm">Loading map...</p>
      <p className="text-gray-500 text-xs mt-1">Please wait...</p>
    </div>
  </div>
);

// Error component
const MapError = () => (
  <div className="flex items-center justify-center h-full bg-red-50">
    <div className="text-center p-4">
      <div className="text-red-600 text-4xl mb-2">⚠️</div>
      <p className="text-red-600 text-sm font-medium">Failed to load map</p>
      <p className="text-red-500 text-xs mt-1">Check your internet connection</p>
      <div className="mt-4 p-3 bg-white rounded border">
        <p className="text-xs text-gray-600">API Key: {GOOGLE_MAPS_API_KEY.substring(0, 10)}...</p>
      </div>
    </div>
  </div>
);

const EmployeeTracking = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isLiveTracking] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Load initial employee data
  useEffect(() => {
    import('../data/trackingData').then(({ employeeLocations }) => {
      setEmployees(employeeLocations.map(emp => ({
        ...emp,
        speed: Math.floor(Math.random() * 60) + 20,
        direction: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
        battery: Math.floor(Math.random() * 30) + 70
      })));
    });
  }, []);


  // Simulate real-time updates
  useEffect(() => {
    if (!isLiveTracking) return;

    const interval = setInterval(() => {
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => ({
          ...emp,
          lastUpdate: new Date().toLocaleTimeString(),
          speed: Math.floor(Math.random() * 60) + 20,
          direction: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
          battery: Math.floor(Math.random() * 30) + 70,
          // Simulate slight movement
          lat: emp.lat + (Math.random() - 0.5) * 0.001,
          lng: emp.lng + (Math.random() - 0.5) * 0.001
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveTracking]);

  // Handle search on Enter key press or button click
  const handleSearch = useCallback(() => {
    setSearchTerm(searchInput);
  }, [searchInput]);

  // Handle input change - only update input state, don't search
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const render = (status: Status) => {
    console.log('Map render status:', status);
    switch (status) {
      case Status.LOADING:
        return <MapLoading />;
      case Status.FAILURE:
        return <MapError />;
      case Status.SUCCESS:
        return (
          <MapComponent 
            employees={employees}
            selectedEmployee={selectedEmployee}
            onEmployeeSelect={setSelectedEmployee}
          />
        );
    }
  };

  // Handle employee selection from modal
  const handleEmployeeSelect = useCallback((employeeId: string) => {
    setSelectedEmployee(employeeId);
    setIsModalOpen(false);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSearchInput('');
    setSearchTerm('');
  }, []);

  return (
    <div className="flex-1 min-h-screen">
      {/* Metrics Cards */}
      <div className="px-4 py-4 sm:py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Active Rides', value: '0', subtext: 'Live Status', color: 'text-blue-500' },
            { label: 'Avg Wait Time', value: '4.2 min', subtext: 'Excellent', color: 'text-yellow-500' },
            { label: "Today's Distance", value: '1,247 km', subtext: '+12% from yesterday', color: 'text-green-500' },
            { label: 'Safety Score', value: '98%', subtext: 'Outstanding', color: 'text-purple-500' }
          ].map((metric, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{metric.label}</p>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{metric.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{metric.subtext}</p>
              </div>
                <Icon className={`${metric.color} text-xl sm:text-2xl flex-shrink-0 ml-2`}>●</Icon>
              </div>
            </div>
          ))}
            </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4 px-4 pb-4">
        {/* Google Map */}
        <div className="flex-1 min-w-0 h-[300px] sm:h-[400px] lg:h-[500px]">
          <div className="bg-white rounded-lg shadow-sm border border-gray-300 h-full relative overflow-hidden">
            {/* Fallback Map Interface */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <div className="text-center text-gray-700">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-lg font-semibold mb-2">Employee Tracking Map</h3>
                <p className="text-sm mb-4">Interactive map view</p>
                <div className="bg-white rounded-lg p-4 shadow-lg max-w-xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Active Employees</span>
              </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">On Break</span>
              </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-sm">Offline</span>
            </div>
          </div>
        </div>
      </div>

            {/* Google Maps Wrapper */}
            <div className="absolute inset-0 w-full h-full z-10">
              <Wrapper 
                apiKey={GOOGLE_MAPS_API_KEY} 
                render={render}
                libraries={['places']}
              />
                </div>
              </div>
            </div>

        {/* Status Panel */}
        <div className="w-full lg:w-80 h-[250px] sm:h-[300px] lg:h-[500px]">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            {selectedEmployee ? (
              <>
                <div className="p-3 sm:p-4 flex-1">
                  {(() => {
                    const employee = employees.find(emp => emp.id === selectedEmployee);
                    if (!employee) return null;
                      
                      return (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{employee.name}</h3>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${
                            employee.status === 'Active' ? 'bg-green-500' : 
                            employee.status === 'On Break' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-600">Role</p>
                            <p className="text-sm font-medium">{employee.role}</p>
            </div>

                          <div>
                            <p className="text-xs text-gray-600">Status</p>
                            <p className={`text-sm font-medium ${
                              employee.status === 'Active' ? 'text-green-600' : 
                              employee.status === 'On Break' ? 'text-yellow-600' : 'text-gray-600'
                            }`}>
                              {employee.status}
                            </p>
                      </div>
                      
                          <div>
                            <p className="text-xs text-gray-600">Last Update</p>
                            <p className="text-sm font-medium">{employee.lastUpdate}</p>
                    </div>

                          {employee.speed && (
                            <div>
                              <p className="text-xs text-gray-600">Speed</p>
                              <p className="text-sm font-medium">{employee.speed} km/h</p>
                    </div>
                          )}
                          
                          {employee.battery && (
                            <div>
                              <p className="text-xs text-gray-600">Battery</p>
                              <p className="text-sm font-medium">{employee.battery}%</p>
                        </div>
                          )}
                          
                          <div>
                            <p className="text-xs text-gray-600">Location</p>
                            <p className="text-xs font-medium text-gray-500">{employee.lat.toFixed(4)}, {employee.lng.toFixed(4)}</p>
                  </div>
                            </div>
                      </div>
                    );
                  })()}
                          </div>

                {/* Close Button at Bottom */}
                <div className="p-3 sm:p-4 border-t border-gray-200">
                  <button 
                    onClick={() => setSelectedEmployee(null)}
                    className="w-full bg-black text-yellow-400 py-2 px-3 rounded hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    Close Details
                  </button>
                </div>
              </>
            ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6">
                <Icon className="text-gray-600 mb-3 sm:mb-4 text-xl sm:text-2xl">📍</Icon>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 px-2">
                  {employees.length > 0 ? 'Click on a marker to view details' : 'No employees being tracked'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 max-w-xs px-2">
                  {employees.length > 0 
                    ? 'Select an employee marker on the map to see their details here'
                    : 'Employees will appear here when they start their shifts'
                  }
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-black py-2 px-4 rounded-lg transition-colors text-xs sm:text-sm font-medium w-full max-w-xs cursor-pointer"
                  style={{ backgroundColor: '#FFC11E' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#E6A91A'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#FFC11E'}
                >
                  Track Employee
              </button>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Track Employee Modal */}
      <TrackEmployeeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        employees={employees}
        searchInput={searchInput}
        searchTerm={searchTerm}
        onSearchInputChange={handleInputChange}
        onSearch={handleSearch}
        onEmployeeSelect={handleEmployeeSelect}
      />
    </div>
  );
};

export default EmployeeTracking;