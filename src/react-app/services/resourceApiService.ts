import { ResourceType } from '@/shared/types';

// 211 API Configuration
const API_BASE_URL = 'https://api.211.org/search/v1/api';
const API_KEY = import.meta.env.VITE_211_API_KEY || '';

// Enhanced mock data for fallback when API key is not available
const MOCK_RESOURCES: ResourceType[] = [
  {
    id: 1,
    title: 'Harborview Medical Center',
    category: 'Healthcare',
    description: 'Comprehensive medical services including emergency care, surgery, and specialized treatments.',
    address: '325 9th Ave',
    city: 'Seattle',
    state: 'WA',
    zip: '98104',
    phone: '(206) 744-3000',
    website: 'https://www.uwmedicine.org/harborview',
    email: 'harborview@uwmedicine.org',
    hours: '24/7 Emergency, 8am-5pm Clinics',
    services: 'Emergency Care, Surgery, Primary Care, Specialty Clinics',
    tags: null,
    audience: null,
    image_url: null,
    latitude: 47.5975,
    longitude: -122.3247,
    is_featured: true,
    is_approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Seattle Food Bank',
    category: 'Food Assistance',
    description: 'Providing emergency food assistance and nutrition programs to Seattle residents.',
    address: '1500 NE 50th St',
    city: 'Seattle',
    state: 'WA',
    zip: '98105',
    phone: '(206) 524-6980',
    website: 'https://www.seattlefoodbank.org',
    email: 'info@seattlefoodbank.org',
    hours: 'Mon-Fri 9am-4pm, Sat 10am-2pm',
    services: 'Emergency Food, Nutrition Programs, Baby Formula, Fresh Produce',
    tags: null,
    audience: null,
    image_url: null,
    latitude: 47.6587,
    longitude: -122.3140,
    is_featured: true,
    is_approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export interface SearchParams {
  keyword?: string;
  location?: string;
  distance?: number;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface ResourceApiResponse {
  id: string;
  name: string;
  description: string;
  category: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  phone: string;
  website?: string;
  email?: string;
  hours?: string;
  services: string[];
  location: {
    latitude: number;
    longitude: number;
  };
}

class ResourceApiService {
  private hasApiKey: boolean;

  constructor() {
    this.hasApiKey = !!API_KEY;
  }

  /**
   * Fetch resources from 211 API or fallback to mock data
   */
  async searchResources(params: SearchParams = {}): Promise<ResourceType[]> {
    // If no API key, return enhanced mock data
    if (!this.hasApiKey) {
      console.log('No 211 API key found, using mock data');
      return this.getMockResources(params);
    }

    try {
      const response = await this.fetchFrom211Api(params);
      return this.transform211Data(response);
    } catch (error) {
      console.error('211 API error, falling back to mock data:', error);
      return this.getMockResources(params);
    }
  }

  /**
   * Fetch from 211 API
   */
  private async fetchFrom211Api(params: SearchParams): Promise<ResourceApiResponse[]> {
    const searchParams = new URLSearchParams();

    if (params.keyword) searchParams.append('Keyword', params.keyword);
    if (params.location) searchParams.append('Location', params.location);
    if (params.distance) searchParams.append('Distance', params.distance.toString());
    if (params.category) searchParams.append('Topic', params.category);
    if (params.limit) searchParams.append('Limit', params.limit.toString());
    if (params.offset) searchParams.append('Offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/Search/Keyword?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': API_KEY,
        'User-Agent': 'CommunityCompass/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`211 API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.Results || [];
  }

  /**
   * Transform 211 API response to our ResourceType format
   */
  private transform211Data(apiResponse: ResourceApiResponse[]): ResourceType[] {
    return apiResponse.map((resource, index) => ({
      id: index + 1000, // Use high numbers to avoid conflicts with DB IDs
      title: resource.name || 'Unknown Resource',
      category: this.mapCategory(resource.category),
      description: resource.description || 'No description available',
      address: resource.address?.line1 || null,
      city: resource.address?.city || null,
      state: resource.address?.state || null,
      zip: resource.address?.postalCode || null,
      phone: resource.phone || null,
      website: resource.website || null,
      email: resource.email || null,
      hours: resource.hours || null,
      services: resource.services?.join(', ') || null,
      tags: null,
      audience: null,
      image_url: null,
      latitude: resource.location?.latitude || null,
      longitude: resource.location?.longitude || null,
      is_featured: false, // 211 resources are not featured by default
      is_approved: true, // 211 resources are approved
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  /**
   * Map 211 categories to our categories
   */
  private mapCategory(apiCategory: string): string {
    const categoryMap: Record<string, string> = {
      'Health': 'Healthcare',
      'Food': 'Food Assistance',
      'Housing': 'Housing',
      'Employment': 'Employment',
      'Education': 'Education',
      'Transportation': 'Transportation',
      'Mental Health': 'Mental Health',
      'Legal': 'Legal Aid'
    };

    return categoryMap[apiCategory] || apiCategory;
  }

  /**
   * Get mock resources with filtering
   */
  private getMockResources(params: SearchParams): ResourceType[] {
    let filtered = [...MOCK_RESOURCES];

    // Apply keyword filter
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.title?.toLowerCase().includes(keyword) ||
        resource.description?.toLowerCase().includes(keyword) ||
        (resource.services && resource.services.toLowerCase().includes(keyword))
      );
    }

    // Apply category filter
    if (params.category) {
      filtered = filtered.filter(resource =>
        resource.category?.toLowerCase().includes(params.category!.toLowerCase())
      );
    }

    // Apply location filter (simplified - just filter by state/city)
    if (params.location) {
      const location = params.location.toLowerCase();
      filtered = filtered.filter(resource =>
        (resource.city && resource.city.toLowerCase().includes(location)) ||
        (resource.state && resource.state.toLowerCase().includes(location)) ||
        (resource.zip && resource.zip.includes(location))
      );
    }

    // Apply limit
    if (params.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }

  /**
   * Check if API key is available
   */
  hasApiAccess(): boolean {
    return this.hasApiKey;
  }
}

export const resourceApiService = new ResourceApiService();
