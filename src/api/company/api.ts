import { getApiBaseUrl, getSuperAdminToken } from '../user/api';

// Company API endpoints
export const COMPANY_ENDPOINT = 'company';

export function getCompanyUrl(): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${COMPANY_ENDPOINT}`;
}

export interface CreateCompanyPayload {
  name: string;
  address: string;
  email: string;
  phone: string;
  websiteUrl: string;
  industryId: number;
  sizeId: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPassword: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  industryId?: number;
  sizeId?: number;
}

export interface CreateCompanyResponse {
  data: {
    id: number;
    name: string;
    address: string;
    email: string;
    phone: string;
    websiteUrl: string;
    industryId: number;
    sizeId: number;
    ownerId: number;
    approve: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    owner: {
      id: number;
      name: string;
      email: string;
      phone: string;
      password: string;
      departmentId: null;
      companyId: null;
      isDelete: boolean;
      isActive: boolean;
      isRider: null;
      createdAt: string;
      updatedAt: string;
    };
    industry: {
      id: number;
      name: string;
    };
    size: {
      id: number;
      sizeText: string;
    };
  };
  hasError: boolean;
  message: string;
}

export interface UpdateCompanyResponse {
  data: {
    id: number;
    name: string;
    address: string;
    email: string;
    phone: string;
    websiteUrl: string;
    industryId: number;
    sizeId: number;
    ownerId: number;
    approve: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  hasError: boolean;
  message: string;
}

export async function createCompany(payload: CreateCompanyPayload): Promise<CreateCompanyResponse> {
  const url = getCompanyUrl();

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
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
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
        return 'Invalid company data. Please check all fields and try again.';
      case 401:
        return 'Unauthorized. Please verify your admin token.';
      case 403:
        return 'Access denied. You do not have permission to create companies.';
      case 409:
        return 'Company with this email already exists.';
      case 422:
        return 'Validation error. Please check all required fields.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to create company with status ${response.status}.`;
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

export async function updateCompany(companyId: number, payload: UpdateCompanyPayload): Promise<UpdateCompanyResponse> {
  const url = `${getCompanyUrl()}/${companyId}`;

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
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
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
        return 'Invalid company data. Please check all fields and try again.';
      case 401:
        return 'Unauthorized. Please verify your admin token.';
      case 403:
        return 'Access denied. You do not have permission to update companies.';
      case 404:
        return 'Company not found.';
      case 409:
        return 'Company with this email already exists.';
      case 422:
        return 'Validation error. Please check all required fields.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to update company with status ${response.status}.`;
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

// Company list API
export interface CompanyListItem {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  websiteUrl: string;
  industryId: number;
  sizeId: number;
  ownerId: number;
  approve: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    departmentId: null;
    companyId: null;
    isDelete: boolean;
    isActive: boolean;
    isRider: null;
    createdAt: string;
    updatedAt: string;
  };
  industry?: {
    id: number;
    name: string;
  };
  size?: {
    id: number;
    sizeText: string;
  };
}

export interface GetCompaniesResponse {
  data: CompanyListItem[];
  hasError: boolean;
  message: string;
  total?: number;
  page?: number;
  limit?: number;
}

export async function getCompanies(): Promise<GetCompaniesResponse> {
  const url = getCompanyUrl();

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
        return 'Access denied. You do not have permission to view companies.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to fetch companies with status ${response.status}.`;
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

// Get Company by ID API
export interface GetCompanyByIdResponse {
  data: {
    id: number;
    name: string;
    address: string;
    email: string;
    phone: string;
    websiteUrl: string;
    industryId: number;
    sizeId: number;
    ownerId: number;
    approve: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    Department: any[];
    industry: {
      id: number;
      name: string;
    };
    size: {
      id: number;
      sizeText: string;
    };
    owner: {
      id: number;
      name: string;
      email: string;
      phone: string;
      password: string;
      departmentId: null;
      companyId: number;
      isDelete: boolean;
      isActive: boolean;
      isRider: null;
      createdAt: string;
      updatedAt: string;
    };
  };
  hasError: boolean;
  message: string;
}

export async function getCompanyById(companyId: number): Promise<GetCompanyByIdResponse> {
  const url = `${getCompanyUrl()}/${companyId}`;

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
        return 'Access denied. You do not have permission to view company details.';
      case 404:
        return 'Company not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to fetch company details with status ${response.status}.`;
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

// Companies Meta API
export const COMPANIES_META_ENDPOINT = 'get_companies_meta';

export function getCompaniesMetaUrl(): string {
  const baseUrl = getApiBaseUrl();
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${COMPANIES_META_ENDPOINT}`;
}

export interface CompanySizeMeta {
  sizeText: string;
  count: number;
}

export interface CompaniesMetaData {
  activeCompanies: number;
  sizes: CompanySizeMeta[];
}

export interface GetCompaniesMetaResponse {
  data: Record<string, any>; // Empty object as shown in response
  hasError: boolean;
  message: string;
  metaData: CompaniesMetaData;
}

export async function getCompaniesMeta(): Promise<GetCompaniesMetaResponse> {
  const url = getCompaniesMetaUrl();

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
      method: 'GET', // Changed back to GET as shown in your API client
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
        return 'Access denied. You do not have permission to view companies meta.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Failed to fetch companies meta with status ${response.status}.`;
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

// Delete Company API
export interface DeleteCompanyResponse {
  hasError: boolean;
  message: string;
}

export async function deleteCompany(companyId: number): Promise<DeleteCompanyResponse> {
  const url = `${getCompanyUrl()}/${companyId}`;

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
      method: 'DELETE',
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
        return 'Access denied. You do not have permission to delete companies.';
      case 404:
        return 'Company not found. It may have already been deleted.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Server error (${response.status}). Please try again.`;
    }
  };

  if (!response.ok) {
    const errorMessage = await parseErrorMessage();
    throw new Error(errorMessage);
  }

  try {
    const data = await response.json();
    return data;
  } catch {
    // If response is not JSON, assume success
    return {
      hasError: false,
      message: 'Company deleted successfully'
    };
  }
}

// Update Company Status API
export interface UpdateCompanyStatusResponse {
  hasError: boolean;
  message: string;
}

export async function updateCompanyStatus(companyId: number, isActive: boolean): Promise<UpdateCompanyStatusResponse> {
  const url = `${getCompanyUrl()}/status/update/${companyId}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const adminToken = getSuperAdminToken();
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }

  const payload = {
    isActive: isActive
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
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
        return 'Access denied. You do not have permission to update company status.';
      case 404:
        return 'Company not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Server error (${response.status}). Please try again.`;
    }
  };

  if (!response.ok) {
    const errorMessage = await parseErrorMessage();
    throw new Error(errorMessage);
  }

  try {
    const data = await response.json();
    return data;
  } catch {
    // If response is not JSON, assume success
    return {
      hasError: false,
      message: `Company status updated successfully`
    };
  }
}