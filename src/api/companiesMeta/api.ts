import { getApiBaseUrl, getSuperAdminToken } from '../user/api';

// Company Performance API
export const COMPANY_PERFORMANCE_ENDPOINT = 'company_performance';

export function getCompanyPerformanceUrl(filter: string): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${COMPANY_PERFORMANCE_ENDPOINT}?filter=${filter}`;
}

export interface CompanyPerformanceData {
  companyName: string;
  rides: number;
}

export interface GetCompanyPerformanceResponse {
  data: {
    filter: string;
    data: CompanyPerformanceData[];
  };
  hasError: boolean;
  message: string;
}

export type PerformanceFilter = 'daily' | 'weekly' | 'monthly' | 'yearly';

export async function getCompanyPerformance(filter: PerformanceFilter = 'weekly'): Promise<GetCompanyPerformanceResponse> {
  const url = getCompanyPerformanceUrl(filter);
  
  console.log('🚀 Calling Company Performance API:', url);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const superAdminToken = getSuperAdminToken();
  if (superAdminToken) {
    headers['Authorization'] = `Bearer ${superAdminToken}`;
  }
  
  console.log('📋 Request Headers:', headers);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Handle mixed content
    });
    
    console.log('✅ API Response Status:', response.status, response.statusText);
  } catch (err: any) {
    console.error('❌ Network error:', err);
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
        return 'Access denied. You do not have permission to view company performance data.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to fetch company performance data with status ${response.status}.`;
    }
  };

  if (!response.ok) {
    const message = await parseErrorMessage();
    throw new Error(message);
  }

  try {
    const data = await response.json();
    console.log('📦 Parsed API Response Data:', data);
    return data;
  } catch (err) {
    console.error('❌ Failed to parse response:', err);
    throw new Error('Invalid response from server. Please try again.');
  }
}

