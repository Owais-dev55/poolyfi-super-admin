import { getApiBaseUrl, getSuperAdminToken } from '../user/api';

// Dashboard metadata API
export const DASHBOARD_META_ENDPOINT = 'get_superadmin_dashboard_meta';

export function getDashboardMetaUrl(): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${DASHBOARD_META_ENDPOINT}`;
}

export interface DashboardMetaData {
  totalCompanies: number;
  activeRides: number;
  monthlyRides: number;
  totalRevenue: number;
}

export interface GetDashboardMetaResponse {
  data: DashboardMetaData;
  hasError: boolean;
  message: string;
}

export async function getDashboardMeta(): Promise<GetDashboardMetaResponse> {
  const url = getDashboardMetaUrl();

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
        return 'Access denied. You do not have permission to view dashboard metadata.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to fetch dashboard metadata with status ${response.status}.`;
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

// Sub-admin dashboard metadata API
export const SUB_ADMIN_DASHBOARD_META_ENDPOINT = 'sub_admin_dashboard_meta';

export function getSubAdminDashboardMetaUrl(companyId: number): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${SUB_ADMIN_DASHBOARD_META_ENDPOINT}/${companyId}`;
}

export interface SubAdminDashboardMetaData {
  activeEmployees: number;
  activeRides: number;
  monthlyRides: number;
  oxygenSaved: string;
}

export interface GetSubAdminDashboardMetaResponse {
  data: SubAdminDashboardMetaData;
  hasError: boolean;
  message: string;
}

export async function getSubAdminDashboardMeta(companyId: number): Promise<GetSubAdminDashboardMetaResponse> {
  const url = getSubAdminDashboardMetaUrl(companyId);

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
        return 'Access denied. You do not have permission to view sub-admin dashboard metadata.';
      case 404:
        return 'Company not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to fetch sub-admin dashboard metadata with status ${response.status}.`;
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
