import { ResourceType } from '@/shared/types';
import { resourceApiService, SearchParams } from './resourceApiService';
import * as db from './database';

export interface UnifiedSearchParams extends SearchParams {
  includeUserSubmitted?: boolean;
  userId?: string;
  featured?: boolean;
}

/**
 * Unified resource service that combines 211 API data with user-submitted resources
 */
export class UnifiedResourceService {
  /**
   * Fetch all resources combining 211 API and user-submitted resources
   */
  async fetchAllResources(params: UnifiedSearchParams = {}): Promise<ResourceType[]> {
    try {
      // Fetch from 211 API (or mock data) - DISABLED to force use of curated DB
      const apiResources: ResourceType[] = [];


      // Fetch user-submitted resources from Neon if requested
      let userResources: ResourceType[] = [];
      if (params.includeUserSubmitted) {
        userResources = await this.fetchUserSubmittedResources(params);
      }

      // Combine and deduplicate resources
      const allResources = [...apiResources, ...userResources];

      // Apply additional filtering
      return this.filterResources(allResources, params);
    } catch (error) {
      console.error('Error fetching resources:', error);
      return [];
    }
  }

  /**
   * Fetch user-submitted resources from Neon database
   */
  private async fetchUserSubmittedResources(params: UnifiedSearchParams): Promise<ResourceType[]> {
    try {
      const dbResources = await db.fetchResourcesFromDB({
        featured: params.featured,
        category: params.category,
        search: params.keyword
      });

      return dbResources as ResourceType[];
    } catch (error) {
      console.error('Error fetching user resources:', error);
      return [];
    }
  }

  /**
   * Apply additional filtering to combined resources
   */
  private filterResources(resources: ResourceType[], params: UnifiedSearchParams): ResourceType[] {
    let filtered = [...resources];

    // Apply location-based filtering if location is specified
    if (params.location && params.distance) {
      filtered = this.filterByLocation(filtered, params.location, params.distance);
    }

    // Apply pagination
    if (params.offset) {
      filtered = filtered.slice(params.offset);
    }
    if (params.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    return filtered;
  }

  /**
   * Filter resources by location (simplified implementation)
   */
  private filterByLocation(resources: ResourceType[], location: string, _distance: number): ResourceType[] {
    // For now, just filter by state/city containing the location string
    // In a real implementation, you'd use geospatial calculations
    const locationLower = location.toLowerCase();

    return resources.filter(resource =>
      (resource.city && resource.city.toLowerCase().includes(locationLower)) ||
      (resource.state && resource.state.toLowerCase().includes(locationLower)) ||
      (resource.zip && resource.zip.includes(location))
    );
  }

  /**
   * Get user's saved resources
   */
  async getUserSavedResources(userId: string): Promise<number[]> {
    try {
      return await db.fetchSavesFromDB(userId);
    } catch (error) {
      console.error('Error fetching saved resources:', error);
      return [];
    }
  }

  /**
   * Save a resource for a user
   */
  async saveResource(userId: string, resourceId: number): Promise<boolean> {
    try {
      return await db.addSaveToDB(userId, resourceId);
    } catch (error) {
      console.error('Error saving resource:', error);
      return false;
    }
  }

  /**
   * Remove a saved resource for a user
   */
  async unsaveResource(userId: string, resourceId: number): Promise<boolean> {
    try {
      return await db.removeSaveFromDB(userId, resourceId);
    } catch (error) {
      console.error('Error unsaving resource:', error);
      return false;
    }
  }

  /**
   * Get statistics about resources
   */
  async getResourceStats(): Promise<{ total: number; featured: number; userSubmitted: number }> {
    try {
      // Get API stats - DISABLED

      // Get database stats
      const dbStats = await db.fetchStatsFromDB();

      return {
        total: dbStats.total,
        featured: dbStats.featured,
        userSubmitted: dbStats.total
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { total: 0, featured: 0, userSubmitted: 0 };
    }
  }

  /**
   * Check if 211 API is available
   */
  hasApiAccess(): boolean {
    return resourceApiService.hasApiAccess();
  }
}

export const unifiedResourceService = new UnifiedResourceService();
