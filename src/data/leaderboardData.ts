// Leaderboard page data

export interface Company {
  id: string;
  name: string;
  initials: string;
  industry: string;
  size: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  rides: number;
  score: number;
  rank: number;
  isTopPerformer?: boolean;
  avatarColor: string;
  revenue: number;
  efficiency: number;
}

export const companies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    initials: 'TC',
    industry: 'Technology',
    size: 'Large',
    rides: 1250,
    score: 98,
    rank: 1,
    isTopPerformer: true,
    avatarColor: 'bg-blue-500',
    revenue: 125000,
    efficiency: 95
  },
  {
    id: '2',
    name: 'Green Energy Co',
    initials: 'GE',
    industry: 'Energy',
    size: 'Medium',
    rides: 980,
    score: 96,
    rank: 2,
    isTopPerformer: true,
    avatarColor: 'bg-green-500',
    revenue: 98000,
    efficiency: 92
  },
  {
    id: '3',
    name: 'Finance First',
    initials: 'FF',
    industry: 'Finance',
    size: 'Small',
    rides: 750,
    score: 94,
    rank: 3,
    isTopPerformer: true,
    avatarColor: 'bg-yellow-500',
    revenue: 75000,
    efficiency: 88
  },
  {
    id: '4',
    name: 'HealthTech Innovations',
    initials: 'HI',
    industry: 'Healthcare',
    size: 'Large',
    rides: 650,
    score: 92,
    rank: 4,
    avatarColor: 'bg-red-500',
    revenue: 65000,
    efficiency: 85
  },
  {
    id: '5',
    name: 'RetailMax',
    initials: 'RM',
    industry: 'Retail',
    size: 'Medium',
    rides: 580,
    score: 90,
    rank: 5,
    avatarColor: 'bg-purple-500',
    revenue: 58000,
    efficiency: 82
  },
  {
    id: '6',
    name: 'EduTech Systems',
    initials: 'ES',
    industry: 'Education',
    size: 'Small',
    rides: 420,
    score: 88,
    rank: 6,
    avatarColor: 'bg-indigo-500',
    revenue: 42000,
    efficiency: 78
  },
  {
    id: '7',
    name: 'Manufacturing Plus',
    initials: 'MP',
    industry: 'Manufacturing',
    size: 'Enterprise',
    rides: 380,
    score: 86,
    rank: 7,
    avatarColor: 'bg-gray-500',
    revenue: 38000,
    efficiency: 75
  },
  {
    id: '8',
    name: 'StartupHub',
    initials: 'SH',
    industry: 'Technology',
    size: 'Small',
    rides: 320,
    score: 84,
    rank: 8,
    avatarColor: 'bg-pink-500',
    revenue: 32000,
    efficiency: 72
  }
];