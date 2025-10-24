import { useState, useEffect } from 'react';
import { getUserProfile, resetPassword } from '../api/user/api';
import { customToast } from '../utils/useCustomToast';
import { useAuth } from '../contexts/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface ValidationErrors {
  adminName?: string;
  email?: string;
  phoneNumber?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const SettingsPage = () => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState({
    adminName: 'Super Admin',
    email: 'superadmin@poolyfi.com',
    phoneNumber: '+92-300-1234567',
    role: 'Super Administrator',
    permissions: 'Company Management Only'
  });

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });


  // Validation states
  const [adminErrors, setAdminErrors] = useState<ValidationErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<ValidationErrors>({});
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        console.log('User not authenticated, skipping profile fetch');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching user profile...');
        
        // Check if we have a token in localStorage
        const token = localStorage.getItem('auth_token');
        console.log('Token available:', !!token);
        
        const response = await getUserProfile();
        
        if (response.hasError) {
          throw new Error(response.message || 'Failed to fetch profile');
        }
        
        // Update admin info with API data
        setAdminInfo(prev => ({
          ...prev,
          adminName: response.data.name,
          email: response.data.email,
          phoneNumber: response.data.phone,
        }));
        
        console.log('Profile fetched successfully:', response.data);
      } catch (error: any) {
        console.error('Failed to fetch profile:', error);
        customToast.error(error.message || 'Failed to fetch profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  // Validation functions
  const validateAdminName = (name: string): string | undefined => {
    if (!name.trim()) return 'Administrator name is required';
    if (name.length < 2) return 'Administrator name must be at least 2 characters';
    if (name.length > 50) return 'Administrator name must not exceed 50 characters';
    if (!/^[a-zA-Z\s.-]+$/.test(name)) return 'Administrator name can only contain letters, spaces, dots, and hyphens';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email address is required';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePhoneNumber = (phone: string): string | undefined => {
    if (!phone.trim()) return 'Phone number is required';
    const cleanNumber = phone.replace(/\D/g, '');
    
    // Check if it's a valid Pakistani mobile number
    if (cleanNumber.startsWith('92') && cleanNumber.length === 12) {
      const mobilePart = cleanNumber.substring(2);
      if (!mobilePart.match(/^[3][0-9]{9}$/)) {
        return 'Please enter a valid Pakistani mobile number starting with 03XX-XXXXXXX';
      }
    } else if (cleanNumber.startsWith('0') && cleanNumber.length === 11) {
      const mobilePart = cleanNumber.substring(1);
      if (!mobilePart.match(/^[3][0-9]{9}$/)) {
        return 'Please enter a valid Pakistani mobile number starting with 03XX-XXXXXXX';
      }
    } else if (cleanNumber.length === 10) {
      if (!cleanNumber.match(/^[3][0-9]{9}$/)) {
        return 'Please enter a valid Pakistani mobile number starting with 03XX-XXXXXXX';
      }
    } else {
      return 'Please enter a valid Pakistani mobile number (e.g., +92-300-1234567, 0300-1234567, or 3001234567)';
    }
    return undefined;
  };

  const validateCurrentPassword = (password: string): string | undefined => {
    if (!password.trim()) return 'Current password is required';
    if (password.length < 6) return 'Current password must be at least 6 characters';
    return undefined;
  };

  const validateNewPassword = (password: string): string | undefined => {
    if (!password.trim()) return 'New password is required';
    if (password.length < 8) return 'New password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'New password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'New password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'New password must contain at least one number';
    if (!/(?=.*[@$!%*?&])/.test(password)) return 'New password must contain at least one special character';
    return undefined;
  };

  const validateConfirmPassword = (password: string, newPassword: string): string | undefined => {
    if (!password.trim()) return 'Please confirm your new password';
    if (password !== newPassword) return 'Passwords do not match';
    return undefined;
  };

  const handleAdminInfoChange = (field: string, value: string) => {
    setAdminInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (adminErrors[field as keyof ValidationErrors]) {
      setAdminErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Real-time validation as user types
    let error: string | undefined;
    switch (field) {
      case 'adminName':
        error = validateAdminName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phoneNumber':
        error = validatePhoneNumber(value);
        break;
      default:
        break;
    }

    // Only show error if there is one and user has started typing
    if (error && value.length > 0) {
      setAdminErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (passwordErrors[field as keyof ValidationErrors]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Real-time validation as user types
    let error: string | undefined;
    switch (field) {
      case 'currentPassword':
        error = validateCurrentPassword(value);
        break;
      case 'newPassword':
        error = validateNewPassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, passwordInfo.newPassword);
        break;
      default:
        break;
    }

    // Only show error if there is one and user has started typing
    if (error && value.length > 0) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
    
    // Re-validate confirm password if new password changes
    if (field === 'newPassword' && passwordInfo.confirmPassword) {
      const confirmError = validateConfirmPassword(passwordInfo.confirmPassword, value);
      setPasswordErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };


  const handleSaveAdminInfo = async () => {
    // Validate all fields
    const errors: ValidationErrors = {};
    
    const adminNameError = validateAdminName(adminInfo.adminName);
    if (adminNameError) errors.adminName = adminNameError;
    
    const emailError = validateEmail(adminInfo.email);
    if (emailError) errors.email = emailError;
    
    const phoneError = validatePhoneNumber(adminInfo.phoneNumber);
    if (phoneError) errors.phoneNumber = phoneError;
    
    setAdminErrors(errors);
    
    // If there are validation errors, don't proceed
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setIsAdminLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving admin info:', adminInfo);
      customToast.success('Admin information updated successfully!');
    } catch (error) {
      console.error('Error saving admin info:', error);
      customToast.error('Failed to update admin information. Please try again.');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    // Validate all fields
    const errors: ValidationErrors = {};
    
    const currentPasswordError = validateCurrentPassword(passwordInfo.currentPassword);
    if (currentPasswordError) errors.currentPassword = currentPasswordError;
    
    const newPasswordError = validateNewPassword(passwordInfo.newPassword);
    if (newPasswordError) errors.newPassword = newPasswordError;
    
    const confirmPasswordError = validateConfirmPassword(passwordInfo.confirmPassword, passwordInfo.newPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    
    setPasswordErrors(errors);
    
    // If there are validation errors, don't proceed
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setIsPasswordLoading(true);
    
    try {
      // Call the password reset API
      const response = await resetPassword({
        oldPassword: passwordInfo.currentPassword,
        password: passwordInfo.newPassword
      });
      
      if (response.hasError) {
        throw new Error(response.message || 'Failed to update password');
      }
      
      customToast.success('Password updated successfully!');
      
      // Clear password fields
      setPasswordInfo({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear any existing errors
      setPasswordErrors({});
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      customToast.error(error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (isLoading) {
  return (
    <div className="flex-1 min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loading Skeleton for Left Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <Skeleton width={200} height={24} />
                <div className="space-y-4 mt-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i}>
                      <Skeleton width={120} height={14} />
                      <Skeleton width="100%" height={36} />
                    </div>
                  ))}
                  <Skeleton width="100%" height={40} />
                </div>
              </div>
            </div>

            {/* Loading Skeleton for Right Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <Skeleton width={150} height={24} />
                <div className="space-y-4 mt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <Skeleton width={120} height={14} />
                      <Skeleton width="100%" height={36} />
                    </div>
                  ))}
                  <Skeleton width="100%" height={40} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your profile and system preferences</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Super Admin Information */}
          <div className="space-y-6">
            {/* Super Admin Information Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Super Administrator Profile</h2>
              
              <div className="space-y-4">
                {/* Admin Name */}
                <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Administrator Name
                  </label>
                  <input
                    type="text"
                    value={adminInfo.adminName}
                    onChange={(e) => handleAdminInfoChange('adminName', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:border-transparent transition-colors duration-200 ${
                      adminErrors.adminName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Enter administrator name"
                  />
                  {adminErrors.adminName && (
                    <p className="text-red-500 text-xs mt-1">{adminErrors.adminName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={adminInfo.email}
                    onChange={(e) => handleAdminInfoChange('email', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:border-transparent transition-colors duration-200 ${
                      adminErrors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="Enter email address"
                  />
                  {adminErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{adminErrors.email}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={adminInfo.phoneNumber}
                    onChange={(e) => handleAdminInfoChange('phoneNumber', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:border-transparent transition-colors duration-200 ${
                      adminErrors.phoneNumber 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                    placeholder="+92-300-1234567 or 0300-1234567"
                  />
                  {adminErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">{adminErrors.phoneNumber}</p>
                  )}
                </div>

                {/* Role (Read-only) */}
                <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Role
                  </label>
                  <input
                    type="text"
                    value={adminInfo.role}
                    disabled
                     className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Permissions (Read-only) */}
                <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Permissions
                  </label>
                  <input
                    type="text"
                    value={adminInfo.permissions}
                    disabled
                     className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Save Changes Button */}
                <button
                  onClick={handleSaveAdminInfo}
                  disabled={isAdminLoading}
                  className="w-full bg-[#FFC11E] hover:bg-[#E6B800] text-black font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdminLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Password & Preferences */}
          <div className="space-y-6">
            {/* Change Password Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
              
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordInfo.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 bg-gray-50 border rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:border-transparent transition-colors duration-200 ${
                        passwordErrors.currentPassword 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-200 focus:ring-blue-500'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordInfo.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 bg-gray-50 border rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:border-transparent transition-colors duration-200 ${
                        passwordErrors.newPassword 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-200 focus:ring-blue-500'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showNewPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                   <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordInfo.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 bg-gray-50 border rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:border-transparent transition-colors duration-200 ${
                        passwordErrors.confirmPassword 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-200 focus:ring-blue-500'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Update Password Button */}
                <button
                  onClick={handleUpdatePassword}
                  disabled={isPasswordLoading}
                  className="w-full bg-[#FFC11E] hover:bg-[#E6B800] text-black font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPasswordLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </div>

            {/* Super Admin Preferences Card */}
            {/* <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">System Preferences</h2>
              
              <div className="space-y-4">
                {/* Email Notifications */}
                {/* <div className="flex items-center justify-between">
                   <label className="text-xs font-semibold text-gray-700">
                    Email Notifications
                  </label>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                      className="sr-only"
                    />
                    <div
                       className={`w-12 h-6 rounded-full transition-all duration-300 ease-in-out cursor-pointer shadow-inner flex items-center ${
                         preferences.emailNotifications 
                           ? 'bg-[#FFC11E] shadow-[#FFC11E]/30' 
                           : 'bg-gray-300 shadow-gray-300/30'
                      }`}
                      onClick={() => handlePreferenceChange('emailNotifications', !preferences.emailNotifications)}
                    >
                      <div
                         className={`w-5 h-5 bg-black rounded-full shadow-lg transform transition-all duration-300 ease-in-out ${
                           preferences.emailNotifications 
                             ? 'translate-x-6' 
                             : 'translate-x-0.5'
                         }`}
                      />
                    </div>
                  </div>
                </div> */}

                {/* Company Creation Alerts */}
                {/* <div className="flex items-center justify-between">
                   <label className="text-xs font-semibold text-gray-700">
                    Company Creation Alerts
                  </label>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={preferences.companyCreationAlerts}
                      onChange={(e) => handlePreferenceChange('companyCreationAlerts', e.target.checked)}
                      className="sr-only"
                    />
                    <div
                       className={`w-12 h-6 rounded-full transition-all duration-300 ease-in-out cursor-pointer shadow-inner flex items-center ${
                         preferences.companyCreationAlerts 
                           ? 'bg-[#FFC11E] shadow-[#FFC11E]/30' 
                           : 'bg-gray-300 shadow-gray-300/30'
                      }`}
                      onClick={() => handlePreferenceChange('companyCreationAlerts', !preferences.companyCreationAlerts)}
                    >
                      <div
                         className={`w-5 h-5 bg-black rounded-full shadow-lg transform transition-all duration-300 ease-in-out ${
                           preferences.companyCreationAlerts 
                             ? 'translate-x-6' 
                             : 'translate-x-0.5'
                         }`}
                      />
                    </div>
                  </div>
                </div> */}

                {/* System Updates */}
                {/* <div className="flex items-center justify-between">
                   <label className="text-xs font-semibold text-gray-700">
                    System Updates
                  </label>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={preferences.systemUpdates}
                      onChange={(e) => handlePreferenceChange('systemUpdates', e.target.checked)}
                      className="sr-only"
                    />
                    <div
                       className={`w-12 h-6 rounded-full transition-all duration-300 ease-in-out cursor-pointer shadow-inner flex items-center ${
                         preferences.systemUpdates 
                           ? 'bg-[#FFC11E] shadow-[#FFC11E]/30' 
                           : 'bg-gray-300 shadow-gray-300/30'
                      }`}
                      onClick={() => handlePreferenceChange('systemUpdates', !preferences.systemUpdates)}
                    >
                      <div
                         className={`w-5 h-5 bg-black rounded-full shadow-lg transform transition-all duration-300 ease-in-out ${
                           preferences.systemUpdates 
                             ? 'translate-x-6' 
                             : 'translate-x-0.5'
                         }`}
                      />
                    </div>
                  </div>
                </div> */}

                {/* Data Export */}
                {/* <div className="flex items-center justify-between">
                   <label className="text-xs font-semibold text-gray-700">
                    Data Export Access
                  </label>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={preferences.dataExport}
                      onChange={(e) => handlePreferenceChange('dataExport', e.target.checked)}
                      className="sr-only"
                    />
                    <div
                       className={`w-12 h-6 rounded-full transition-all duration-300 ease-in-out cursor-pointer shadow-inner flex items-center ${
                         preferences.dataExport 
                           ? 'bg-[#FFC11E] shadow-[#FFC11E]/30' 
                           : 'bg-gray-300 shadow-gray-300/30'
                      }`}
                      onClick={() => handlePreferenceChange('dataExport', !preferences.dataExport)}
                    >
                      <div
                         className={`w-5 h-5 bg-black rounded-full shadow-lg transform transition-all duration-300 ease-in-out ${
                           preferences.dataExport 
                             ? 'translate-x-6' 
                             : 'translate-x-0.5'
                         }`}
                      />
                    </div>
                  </div>
                </div> */}
              {/* </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
