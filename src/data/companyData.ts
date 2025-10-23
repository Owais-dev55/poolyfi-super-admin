// Company Management page data
import type { CompanyListItem } from '../api/company/api';

export interface Company {
  id: string;
  name: string;
  address: string;
  email: string;
  industry: string;
  industryId: number;
  size: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  sizeId: number;
  status: 'Active' | 'Inactive';
  avatar: string;
  phoneNumber: string;
  website: string;
  createdAt: string;
}

// Helper function to map API response to UI Company interface
export function mapApiCompanyToUI(apiCompany: CompanyListItem): Company {
  // Map size ID to size text
  const sizeMap: Record<number, 'Small' | 'Medium' | 'Large' | 'Enterprise'> = {
    4: 'Small',    // 1-50
    5: 'Medium',   // 51-200
    6: 'Large'     // 200 above
  };

  // Map industry ID to industry name based on API data
  const industryMap: Record<number, string> = {
    1: 'IT',
    2: 'Healthcare',
    3: 'Finance',
    4: 'Education',
    5: 'Construction',
    6: 'Retail',
    7: 'Transport',
    8: 'Energy',
    9: 'Manufacturing',
    10: 'Media'
  };

  // Debug logging to understand the API response structure
  console.log('Mapping company:', apiCompany.name, {
    industryId: apiCompany.industryId,
    industry: apiCompany.industry,
    sizeId: apiCompany.sizeId,
    size: apiCompany.size
  });

  // Get size text - prioritize sizeId mapping, fallback to size.sizeText, then default
  let sizeText: 'Small' | 'Medium' | 'Large' | 'Enterprise' = 'Small';
  
  if (apiCompany.sizeId && sizeMap[apiCompany.sizeId]) {
    sizeText = sizeMap[apiCompany.sizeId];
  } else if (apiCompany.size?.sizeText) {
    // Fallback to size.sizeText from API if available
    const sizeFromText = apiCompany.size.sizeText.toLowerCase();
    if (sizeFromText.includes('small') || sizeFromText.includes('1-50')) {
      sizeText = 'Small';
    } else if (sizeFromText.includes('medium') || sizeFromText.includes('51-200')) {
      sizeText = 'Medium';
    } else if (sizeFromText.includes('large') || sizeFromText.includes('200 above')) {
      sizeText = 'Large';
    } else if (sizeFromText.includes('enterprise') || sizeFromText.includes('500+')) {
      sizeText = 'Enterprise';
    }
  }

  // Get industry name - prioritize industry.name from API, fallback to industryId mapping, then default
  let industryName = 'Unknown';
  if (apiCompany.industry?.name) {
    industryName = apiCompany.industry.name;
  } else if (apiCompany.industryId && industryMap[apiCompany.industryId]) {
    industryName = industryMap[apiCompany.industryId];
  }

  console.log('Mapped company:', apiCompany.name, {
    industryName,
    sizeText,
    industryId: apiCompany.industryId,
    sizeId: apiCompany.sizeId
  });

  return {
    id: apiCompany.id.toString(),
    name: apiCompany.name,
    address: apiCompany.address,
    email: apiCompany.email,
    industry: industryName,
    industryId: apiCompany.industryId || 0,
    size: sizeText,
    sizeId: apiCompany.sizeId || 4,
    status: apiCompany.isActive ? 'Active' : 'Inactive',
    avatar: apiCompany.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    phoneNumber: apiCompany.phone,
    website: apiCompany.websiteUrl,
    createdAt: apiCompany.createdAt
  };
}

export const initialCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    address: '123 Tech Street, San Francisco, CA',
    email: 'contact@techcorp.com',
    industry: 'Technology',
    industryId: 1,
    size: 'Large',
    sizeId: 6,
    status: 'Active',
    avatar: 'TC',
    phoneNumber: '+1 (555) 123-4567',
    website: 'https://techcorp.com',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Green Energy Co',
    address: '456 Green Ave, Portland, OR',
    email: 'info@greenenergy.com',
    industry: 'Energy',
    industryId: 4,
    size: 'Medium',
    sizeId: 5,
    status: 'Active',
    avatar: 'GE',
    phoneNumber: '+1 (555) 234-5678',
    website: 'https://greenenergy.com',
    createdAt: '2024-01-20T14:45:00Z'
  },
  {
    id: '3',
    name: 'Finance First',
    address: '789 Wall Street, New York, NY',
    email: 'support@financefirst.com',
    industry: 'Finance',
    industryId: 2,
    size: 'Small',
    sizeId: 4,
    status: 'Inactive',
    avatar: 'FF',
    phoneNumber: '+1 (555) 345-6789',
    website: 'https://financefirst.com',
    createdAt: '2024-01-10T09:15:00Z'
  }
];
