import { getApiBaseUrl, getSuperAdminToken } from '../user/api';

// Leaderboard API
export const LEADERBOARD_ENDPOINT = 'superadmin_leaderboard';

export function getLeaderboardUrl(): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${LEADERBOARD_ENDPOINT}`;
}

export interface LeaderboardCompany {
  id: number;
  name: string;
  email: string;
  websiteUrl: string;
  industry: string;
  size: string;
  totalRides: number;
  completedRides: number;
  revenue: number;
  efficiency: number;
  score: number;
  rank: number;
  leaderboardRank: number;
}

export interface LeaderboardMetaData {
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
  totalItems: number;
}

export interface GetLeaderboardResponse {
  data: LeaderboardCompany[];
  hasError: boolean;
  message: string;
  metaData: LeaderboardMetaData;
}

export interface LeaderboardParams {
  page?: number;
  industryId?: number;
  search?: string;
  limit?: number;
}

// Helper function to check if error is token related and redirect to login
function handleAuthError(response: Response, errorMessage: string): void {
  console.log('Checking auth error...');
  console.log('Status:', response.status);
  console.log('Error message:', errorMessage);
  
  const isTokenExpired = 
    response.status === 401 ||
    errorMessage.toLowerCase().includes('token expired') ||
    errorMessage.toLowerCase().includes('user logged out') ||
    errorMessage.toLowerCase().includes('unauthorized');

  console.log('Is token expired?', isTokenExpired);

  if (isTokenExpired) {
    console.log('Redirecting to login...');
    localStorage.removeItem('superAdminToken');
    window.location.href = '/login';
  }
}

export async function getLeaderboard(params: LeaderboardParams = {}): Promise<GetLeaderboardResponse> {
  const url = new URL(getLeaderboardUrl());
  
  // Add query parameters
  if (params.page) url.searchParams.append('page', params.page.toString());
  if (params.industryId) url.searchParams.append('industryId', params.industryId.toString());
  if (params.search) url.searchParams.append('search', params.search);
  if (params.limit) url.searchParams.append('limit', params.limit.toString());

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const superAdminToken = getSuperAdminToken();
  if (superAdminToken) {
    headers['Authorization'] = `Bearer ${superAdminToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      mode: 'cors',
      credentials: 'omit',
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
        return 'Access denied. You do not have permission to view leaderboard data.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to fetch leaderboard data with status ${response.status}.`;
    }
  };

  if (!response.ok) {
    const message = await parseErrorMessage();
    
    // Check for token expiry and redirect if needed
     console.log('Response status:', response.status);
  console.log('Error message:', message);
  console.log('Full response:', response);
  
    handleAuthError(response, message);
    
    throw new Error(message);
  }

  try {
    const data = await response.json();
    
    // Also check in successful response for token expiry messages
    if (data.hasError && data.message) {
      const isTokenError = 
        data.message.toLowerCase().includes('token expired') ||
        data.message.toLowerCase().includes('user logged out');
      
      if (isTokenError) {
        handleAuthError(response, data.message);
      }
    }
    
    return data;
  } catch {
    throw new Error('Invalid response from server. Please try again.');
  }
}