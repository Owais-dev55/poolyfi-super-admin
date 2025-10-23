// utils/api.ts or services/api.ts

// Define response type
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

// Custom fetch wrapper with authentication check
export const fetchWithAuth = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T> | null> => {
  try {
    const response = await fetch(url, options);
    const data: ApiResponse<T> = await response.json();
    
    // Check for token expired or logged out errors
    const isTokenExpired = 
      data.error === 'token expired' || 
      data.error === 'user logged out' ||
      data.message === 'token expired' ||
      data.message === 'user logged out' ||
      response.status === 401;
    
    if (isTokenExpired) {
      // Clear stored token
      localStorage.removeItem('token');
      
      // Redirect to login
      window.location.href = '/login';
      
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Optional: Helper to add auth header
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};