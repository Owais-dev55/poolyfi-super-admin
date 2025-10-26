export function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!baseUrl) {
    // Fallback to the provided API base URL
    return 'https://62-72-24-4.sslip.io/api';
  }
  return baseUrl;
}

export function getAdminToken(): string | undefined {
  const token = import.meta.env.VITE_ADMIN_TOKEN as string | undefined;
  if (!token) {
    // Fallback to the provided JWT token
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBwb29seWZpLmNvbSIsImRlcGFydG1lbnRJZCI6bnVsbCwiaWF0IjoxNzU4NjI4NzY2LCJleHAiOjE3NTkyMzM1NjZ9.cstMmG4fpz697BCceyEhHzzLxnKkyw44x8batw1JQu8';
  }
  return token;
}

export function getSuperAdminToken(): string | undefined {

  // First try to get token from localStorage (from login session)
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      return storedToken;
    }
  }
  
  // Fallback to environment variable
  const token = import.meta.env.VITE_SUPER_ADMIN_TOKEN as string | undefined;
  if (!token) {

    // Final fallback to the admin token if super admin token is not set
    return getAdminToken();
  }
  return token;
}


// Admin login endpoint
export const ADMIN_LOGIN_ENDPOINT = 'login_admin';

export function getAdminLoginUrl(): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${ADMIN_LOGIN_ENDPOINT}`;
}

export interface AdminLoginResponse {
  data?: any;
  accessToken?: string;
}

export async function loginAdmin(email: string, password: string): Promise<AdminLoginResponse> {
  const url = getAdminLoginUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const adminToken = getAdminToken();
  if (adminToken) {
    headers['x-token'] = adminToken;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Handle mixed content
    });
  } catch (err: any) {
    console.error('Network error:', err);
    throw new Error('Network error. Please check your internet connection and API configuration.');
  }

  const parseErrorMessage = async (): Promise<string> => {
    try {
      const json = await response.clone().json();
      if (typeof json === 'string') return json;
      if (json?.message) return String(json.message);
      if (json?.error) return String(json.error);
      if (Array.isArray(json?.errors) && json.errors[0]?.message) {
        return String(json.errors[0].message);
      }
    } catch {
      // ignore json parse errors
    }
    try {
      const text = await response.text();
      if (text) return text;
    } catch {
      // ignore text read errors
    }
    switch (response.status) {
      case 400:
        return 'Invalid credentials. Please check your email and password.';
      case 401:
        return 'Unauthorized. Please verify your admin token or credentials.';
      case 403:
        return 'Access denied. Your account does not have permission.';
      case 404:
        return 'Login service not found. Please try again later.';
      case 429:
        return 'Too many attempts. Please wait and try again.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Login failed with status ${response.status}.`;
    }
  };

  if (!response.ok) {
    const message = await parseErrorMessage();
    throw new Error(message);
  }

  try {
    const data = await response.json();
    return data;
  } catch {
    // Some APIs return no JSON; return empty object
    return {};
  }
}


// Company Employees API
export const COMPANY_EMPLOYEES_ENDPOINT = 'user/company';

export function getCompanyEmployeesUrl(companyId: number): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${COMPANY_EMPLOYEES_ENDPOINT}/${companyId}`;
}

export interface CompanyEmployee {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  departmentId: number | null;
  companyId: number;
  isDelete: boolean;
  isActive: boolean;
  isRider: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetCompanyEmployeesResponse {
  data: CompanyEmployee[];
  hasError: boolean;
  message: string;
  metaData: {
    totalPages: number;
    currentPage: number;
    nextPage: number | null;
    previousPage: number | null;
    totalItems: number;
  };
}

export async function getCompanyEmployees(companyId: number): Promise<GetCompanyEmployeesResponse> {
  const url = getCompanyEmployeesUrl(companyId);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const superAdminToken = getSuperAdminToken();
  if (superAdminToken) {
    headers['Authorization'] = `Bearer ${superAdminToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Handle mixed content
    });
  } catch (err: any) {
    console.error('Network error:', err);
    throw new Error('Network error. Please check your internet connection and API configuration.');
  }

  const parseErrorMessage = async (): Promise<string> => {
    try {
      const json = await response.clone().json();
      if (typeof json === 'string') return json;
      if (json?.message) return String(json.message);
      if (json?.error) return String(json.error);
      if (Array.isArray(json?.errors) && json.errors[0]?.message) {
        return String(json.errors[0].message);
      }
    } catch {
      // ignore json parse errors
    }
    try {
      const text = await response.text();
      if (text) return text;
    } catch {
      // ignore text read errors
    }
    switch (response.status) {
      case 401:
        return 'Unauthorized. Please verify your admin token.';
      case 403:
        return 'Access denied. You do not have permission to view company employees.';
      case 404:
        return 'Company not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to fetch company employees with status ${response.status}.`;
    }
  };

  if (!response.ok) {
    const message = await parseErrorMessage();
    throw new Error(message);
  }

  try {
    const data = await response.json();
    return data;
  } catch {
    throw new Error('Invalid response from server. Please try again.');
  }
}

// Logout API
export const LOGOUT_ENDPOINT = 'user/logout';

export function getLogoutUrl(): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${LOGOUT_ENDPOINT}`;
}

export interface LogoutResponse {
  hasError: boolean;
  message: string;
}

window.addEventListener('storage', (event) => {
  if (event.key === 'auth_token' && event.newValue === null) {
    window.location.replace('/login');
  }
});

export async function logoutUser(): Promise<LogoutResponse> {
  const url = getLogoutUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const superAdminToken = getSuperAdminToken();
  if (superAdminToken) {
    headers['Authorization'] = `Bearer ${superAdminToken}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Logout failed');
    }

    localStorage.removeItem('auth_token');

    window.location.replace('/login');

    return {
      hasError: false,
      message: 'Logged out successfully',
    };
  } catch (err: any) {
    console.error('Logout error:', err);
    throw new Error('Failed to logout. ' + err.message);
  }
}


// Profile API
export const PROFILE_ENDPOINT = 'profile';

export function getProfileUrl(): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${PROFILE_ENDPOINT}`;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  departmentId: number | null;
  companyId: number | null;
  isDelete: boolean;
  isActive: boolean;
  isRider: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetProfileResponse {
  data: UserProfile;
  hasError: boolean;
  message: string;
}

export async function getUserProfile(): Promise<GetProfileResponse> {
  const url = getProfileUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const superAdminToken = getSuperAdminToken();
  if (superAdminToken) {
    headers['Authorization'] = `Bearer ${superAdminToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Handle mixed content
    });
  } catch (err: any) {
    console.error('Network error:', err);
    throw new Error('Network error. Please check your internet connection and API configuration.');
  }

  const parseErrorMessage = async (): Promise<string> => {
    try {
      const json = await response.clone().json();
      if (typeof json === 'string') return json;
      if (json?.message) return String(json.message);
      if (json?.error) return String(json.error);
      if (Array.isArray(json?.errors) && json.errors[0]?.message) {
        return String(json.errors[0].message);
      }
    } catch {
      // ignore json parse errors
    }
    try {
      const text = await response.text();
      if (text) return text;
    } catch {
      // ignore text read errors
    }
    switch (response.status) {
      case 401:
        return 'Unauthorized. Please verify your admin token.';
      case 403:
        return 'Access denied. You do not have permission to view profile.';
      case 404:
        return 'Profile not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to fetch profile with status ${response.status}.`;
    }
  };

  if (!response.ok) {
    const message = await parseErrorMessage();
    throw new Error(message);
  }

  try {
    const data = await response.json();
    return data;
  } catch {
    throw new Error('Invalid response from server. Please try again.');
  }
}

// Password Reset API
export const PASSWORD_RESET_ENDPOINT = 'user/update_password';

export function getPasswordResetUrl(): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  console.log('Password Reset URL:', `${normalizedBaseUrl}/${PASSWORD_RESET_ENDPOINT}`);
  return `${normalizedBaseUrl}/${PASSWORD_RESET_ENDPOINT}`;
}

export interface PasswordResetPayload {
  old_password: string;
  password: string;
}

export interface PasswordResetResponse {
  hasError: boolean;
  message: string;
}

export async function resetPassword(payload: PasswordResetPayload): Promise<PasswordResetResponse> {
  const url = getPasswordResetUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const superAdminToken = getSuperAdminToken();
  if (superAdminToken) {
    headers['Authorization'] = `Bearer ${superAdminToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
      mode: 'cors', 
      credentials: 'omit', 
    });
    localStorage.removeItem('auth_token');
    window.location.replace('/login');
  } catch (err: any) {
    console.error('Network error:', err);
    throw new Error('Network error. Please check your internet connection and API configuration.');
  }

  const parseErrorMessage = async (): Promise<string> => {
    try {
      const json = await response.clone().json();
      if (typeof json === 'string') return json;
      if (json?.message) return String(json.message);
      if (json?.error) return String(json.error);
      if (Array.isArray(json?.errors) && json.errors[0]?.message) {
        return String(json.errors[0].message);
      }
    } catch {
      // ignore json parse errors
    }
    try {
      const text = await response.text();
      if (text) return text;
    } catch {
      // ignore text read errors
    }
    switch (response.status) {
      case 400:
        return 'Invalid password data. Please check your current password and new password requirements.';
      case 401:
        return 'Unauthorized. Please verify your admin token.';
      case 403:
        return 'Access denied. You do not have permission to reset password.';
      case 422:
        return 'Validation error. Please check your password requirements.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to reset password with status ${response.status}.`;
    }
  };

  if (!response.ok) {
    const message = await parseErrorMessage();
    throw new Error(message);
  }

  try {
    const data = await response.json();
    return data;
  } catch {
    // If response is not JSON, assume success
    return {
      hasError: false,
      message: 'Password updated successfully'
    };
  }
}
