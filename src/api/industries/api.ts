import { getApiBaseUrl, getSuperAdminToken } from '../user/api';

// Industries API endpoints
export const INDUSTRIES_ENDPOINT = 'industries';

export function getIndustriesUrl(): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${INDUSTRIES_ENDPOINT}`;
}

export interface Industry {
  id: number;
  name: string;
}

export interface GetIndustriesResponse {
  data: Industry[];
  hasError: boolean;
  message: string;
  total?: number;
  page?: number;
  limit?: number;
}

export async function getIndustries(): Promise<GetIndustriesResponse> {
  const url = getIndustriesUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const adminToken = getSuperAdminToken();
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
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
        return 'Access denied. You do not have permission to view industries.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to fetch industries with status ${response.status}.`;
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
