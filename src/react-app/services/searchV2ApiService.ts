import { ResourceType } from '@/shared/types';

// 211 Search V2 API Configuration
const API_BASE_URL = 'https://api.211.org/resources/v2/search';
const FILTERS_BASE_URL = 'https://api.211.org/resources/v2/search/filters';
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

// Search V2 API Interfaces
export interface SearchV2Params {
  keyword?: string;
  dataOwners?: string;
  taxonomyTerms?: string[];
  tags?: string[];
  locationAddresses?: Array<{
    type: 'locality' | 'postalCode' | 'county' | 'state' | 'country';
    value: string;
  }>;
  distance?: {
    targetLatitude: number;
    targetLongitude: number;
    distanceInMeters: number;
  };
  fields?: string[];
  limit?: number;
  offset?: number;
  returnFacets?: boolean;
}

export interface SearchV2Response {
  results: Array<{
    idServiceAtLocation: string;
    serviceName: string;
    description: string;
    taxonomy: Array<{
      term: string;
      code: string;
      level: number;
    }>;
    location: {
      name: string;
      address: {
        line1: string;
        city: string;
        state: string;
        postalCode: string;
        county?: string;
      };
      latitude: number;
      longitude: number;
    };
    organization: {
      name: string;
    };
    phone: string;
    website?: string;
    email?: string;
    hours?: string;
    services: string[];
  }>;
  facets?: {
    [key: string]: Array<{
      value: string;
      count: number;
    }>;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Filter API Interfaces
export interface LocationValuesParams {
  type: 'locality' | 'postalCode' | 'county' | 'state' | 'country';
  dataOwners: string;
  typeFilter?: 'locality' | 'postalCode' | 'county' | 'state' | 'country';
  typeFilterValues?: string;
}

export interface TagsParams {
  dataOwners?: string;
}

export interface TaxonomyParams {
  dataOwners?: string;
  level?: number;
}

class SearchV2ApiService {
  private hasApiKey: boolean;

  constructor() {
    this.hasApiKey = !!API_KEY;
  }

  /**
   * Search services using the 211 Search V2 API
   */
  async searchServices(params: SearchV2Params = {}): Promise<ResourceType[]> {
    // If no API key, return enhanced mock data
    if (!this.hasApiKey) {
      console.log('No 211 API key found, using mock data');
      return this.getMockResources(params);
    }

    try {
      const response = await this.searchV2Api(params);
      return this.transformV2Data(response);
    } catch (error) {
      console.error('211 Search V2 API error, falling back to mock data:', error);
      return this.getMockResources(params);
    }
  }

  /**
   * Search using GET method (simplified)
   */
  async searchServicesGet(params: SearchV2Params = {}): Promise<ResourceType[]> {
    if (!this.hasApiKey) {
      return this.getMockResources(params);
    }

    try {
      const searchParams = new URLSearchParams();

      if (params.keyword) searchParams.append('keyword', params.keyword);
      if (params.dataOwners) searchParams.append('dataOwners', params.dataOwners);
      if (params.taxonomyTerms) searchParams.append('taxonomyTerms', params.taxonomyTerms.join(','));
      if (params.tags) searchParams.append('tags', params.tags.join(','));
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());
      if (params.returnFacets) searchParams.append('returnFacets', 'true');

      const response = await fetch(`${API_BASE_URL}/keyword?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': API_KEY,
          'User-Agent': 'CommunityCompass/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`211 Search V2 API request failed: ${response.status}`);
      }

      const data: SearchV2Response = await response.json();
      return this.transformV2Data(data);
    } catch (error) {
      console.error('211 Search V2 GET API error, falling back to mock data:', error);
      return this.getMockResources(params);
    }
  }

  /**
   * Search using POST method (advanced)
   */
  private async searchV2Api(params: SearchV2Params): Promise<SearchV2Response> {
    const requestBody: any = {};

    if (params.keyword) requestBody.keyword = params.keyword;
    if (params.dataOwners) requestBody.dataOwners = params.dataOwners;
    if (params.taxonomyTerms) requestBody.taxonomyTerms = params.taxonomyTerms;
    if (params.tags) requestBody.tags = params.tags;
    if (params.locationAddresses) requestBody.locationAddresses = params.locationAddresses;
    if (params.distance) requestBody.distance = params.distance;
    if (params.fields) requestBody.fields = params.fields;
    if (params.limit) requestBody.limit = params.limit;
    if (params.offset) requestBody.offset = params.offset;
    if (params.returnFacets) requestBody.returnFacets = params.returnFacets;

    const response = await fetch(`${API_BASE_URL}/keyword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': API_KEY,
        'User-Agent': 'CommunityCompass/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`211 Search V2 API request failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get location values for filtering
   */
  async getLocationValues(params: LocationValuesParams): Promise<string[]> {
    if (!this.hasApiKey) {
      return this.getMockLocationValues(params.type);
    }

    try {
      const searchParams = new URLSearchParams();
      searchParams.append('type', params.type);
      searchParams.append('dataOwners', params.dataOwners);

      if (params.typeFilter) searchParams.append('typeFilter', params.typeFilter);
      if (params.typeFilterValues) searchParams.append('typeFilterValues', params.typeFilterValues);

      const response = await fetch(`${FILTERS_BASE_URL}/location-values?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': API_KEY,
          'User-Agent': 'CommunityCompass/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`211 Location Values API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('211 Location Values API error:', error);
      return this.getMockLocationValues(params.type);
    }
  }

  /**
   * Get available tags
   */
  async getTags(params: TagsParams = {}): Promise<string[]> {
    if (!this.hasApiKey) {
      return this.getMockTags();
    }

    try {
      const searchParams = new URLSearchParams();
      if (params.dataOwners) searchParams.append('dataOwners', params.dataOwners);

      const response = await fetch(`${FILTERS_BASE_URL}/tags?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': API_KEY,
          'User-Agent': 'CommunityCompass/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`211 Tags API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('211 Tags API error:', error);
      return this.getMockTags();
    }
  }

  /**
   * Get taxonomy terms
   */
  async getTaxonomyTerms(params: TaxonomyParams = {}): Promise<Array<{ term: string; code: string; level: number }>> {
    if (!this.hasApiKey) {
      return this.getMockTaxonomyTerms();
    }

    try {
      const searchParams = new URLSearchParams();
      if (params.dataOwners) searchParams.append('dataOwners', params.dataOwners);
      if (params.level) searchParams.append('level', params.level.toString());

      const response = await fetch(`${FILTERS_BASE_URL}/taxonomy-terms?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': API_KEY,
          'User-Agent': 'CommunityCompass/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`211 Taxonomy Terms API request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('211 Taxonomy Terms API error:', error);
      return this.getMockTaxonomyTerms();
    }
  }

  /**
   * Transform Search V2 API response to our ResourceType format
   */
  private transformV2Data(apiResponse: SearchV2Response): ResourceType[] {
    return apiResponse.results.map((result, index) => ({
      id: parseInt(result.idServiceAtLocation) || (index + 1000),
      title: result.serviceName || 'Unknown Service',
      category: this.mapTaxonomyToCategory(result.taxonomy),
      description: result.description || 'No description available',
      address: result.location?.address?.line1 || null,
      city: result.location?.address?.city || null,
      state: result.location?.address?.state || null,
      zip: result.location?.address?.postalCode || null,
      phone: result.phone || null,
      website: result.website || null,
      email: result.email || null,
      hours: result.hours || null,
      services: result.services?.join(', ') || null,
      tags: result.taxonomy?.map(t => t.term).join(', ') || null,
      audience: null,
      image_url: null,
      latitude: result.location?.latitude || null,
      longitude: result.location?.longitude || null,
      is_featured: false,
      is_approved: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }

  /**
   * Map taxonomy terms to our category format
   */
  private mapTaxonomyToCategory(taxonomy: Array<{ term: string; code: string; level: number }>): string {
    if (!taxonomy || taxonomy.length === 0) return 'General';

    // Map common taxonomy terms to our categories
    const categoryMap: Record<string, string> = {
      'Health Care': 'Healthcare',
      'Food': 'Food Assistance',
      'Housing': 'Housing',
      'Employment': 'Employment',
      'Education': 'Education',
      'Transportation': 'Transportation',
      'Mental Health': 'Mental Health',
      'Legal': 'Legal Aid',
      'Financial Assistance': 'Financial Assistance',
      'Child Care': 'Child Care',
      'Senior Services': 'Senior Services'
    };

    // Find the first matching category
    for (const item of taxonomy) {
      const mappedCategory = categoryMap[item.term];
      if (mappedCategory) return mappedCategory;
    }

    return taxonomy[0]?.term || 'General';
  }

  /**
   * Get mock resources with filtering
   */
  private getMockResources(params: SearchV2Params): ResourceType[] {
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

    // Apply limit
    if (params.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }

  /**
   * Mock location values
   */
  private getMockLocationValues(type: string): string[] {
    const mockData: Record<string, string[]> = {
      'state': ['Washington', 'California', 'Oregon', 'Idaho'],
      'county': ['King County', 'Pierce County', 'Snohomish County', 'Thurston County'],
      'city': ['Seattle', 'Tacoma', 'Bellevue', 'Spokane'],
      'postalCode': ['98101', '98102', '98103', '98104', '98001', '98002']
    };
    return mockData[type] || [];
  }

  /**
   * Mock tags
   */
  private getMockTags(): string[] {
    return ['Healthcare', 'Food Assistance', 'Housing', 'Employment', 'Education', 'Transportation'];
  }

  /**
   * Mock taxonomy terms
   */
  private getMockTaxonomyTerms(): Array<{ term: string; code: string; level: number }> {
    return [
      { term: 'Health Care', code: 'HC', level: 1 },
      { term: 'Food', code: 'FO', level: 1 },
      { term: 'Housing', code: 'HO', level: 1 },
      { term: 'Employment', code: 'EM', level: 1 }
    ];
  }

  /**
   * Check if API key is available
   */
  hasApiAccess(): boolean {
    return this.hasApiKey;
  }
}

export const searchV2ApiService = new SearchV2ApiService();
