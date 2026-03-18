import { ResourceType } from '@/shared/types';
import { resourceApiService, SearchParams } from './resourceApiService';
import * as db from './database';

export interface UnifiedSearchParams extends SearchParams {
  includeUserSubmitted?: boolean;
  userId?: string;
  featured?: boolean;
  sortBy?: 'popular' | 'recent' | 'default';
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

      // Fetch resources from Neon (merges curated and main tables)
      // Default includeUserSubmitted to true if not specified
      const includeUser = params.includeUserSubmitted !== false;

      let userResources: ResourceType[] = [];
      if (includeUser) {
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
   * Fetch resources for a specific owner
   */
  async getUserSubmissions(userId: string): Promise<ResourceType[]> {
    try {
      return await db.fetchMySubmissionsFromDB(userId) as ResourceType[];
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      return [];
    }
  }

  /**
   * Delete a resource owned by the user
   */
  async deleteResource(resourceId: number, identifier: string): Promise<boolean> {
    try {
      return await db.deleteResourceFromDB(resourceId, identifier);
    } catch (error) {
      console.error('Error deleting resource:', error);
      return false;
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
        search: params.keyword,
        sortBy: params.sortBy
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
   * Filter resources by location (improved implementation)
   */
  private filterByLocation(resources: ResourceType[], location: string, distance: number = 25): ResourceType[] {
    const locationLower = location.toLowerCase();
    const isZip = /^\d{5}$/.test(location);

    // ZIP Coordinate Mapping (Simplified for common use cases/demo)
    // In a production app, this would query a geocoding API.
    const zipCoords: Record<string, [number, number]> = {
      '02108': [42.3588, -71.0638], // Boston Center
      '02138': [42.3736, -71.1097], // Cambridge
      '90210': [34.0736, -118.4004], // Beverly Hills
      '10001': [40.7501, -73.9979], // NYC
      '30303': [33.7490, -84.3880], // Atlanta
    };

    let searchCoords = isZip ? zipCoords[location] : null;

    // Dynamically infer coordinates if not in hardcoded zipCoords
    if (isZip && !searchCoords) {
      const reference = resources.find(r => r.zip === location && r.latitude && r.longitude);
      if (reference) {
        searchCoords = [reference.latitude!, reference.longitude!];
      }
    }

    return resources.filter(resource => {
      // 1. If we have coordinates for the search location and the resource, use strict radius
      if (searchCoords && resource.latitude && resource.longitude) {
        const d = this.calculateDistance(
          searchCoords[0], searchCoords[1],
          resource.latitude, resource.longitude
        );
        return d <= distance;
      }

      // 2. Fallback to strict ZIP match if input is ZIP and NO coordinates were found
      if (isZip) {
        return resource.zip === location;
      }

      // 3. City/State/Address match
      return (
        (resource.city && resource.city.toLowerCase().includes(locationLower)) ||
        (resource.state && resource.state.toLowerCase().includes(locationLower)) ||
        (resource.address && resource.address.toLowerCase().includes(locationLower)) ||
        (resource.zip && resource.zip.includes(locationLower))
      );
    });
  }

  /**
   * Calculate distance between two points in km
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
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
   * Increment the click count (popularity) of a resource
   */
  async recordClick(resourceId: number): Promise<boolean> {
    try {
      return await db.incrementClickCountInDB(resourceId);
    } catch (error) {
      console.error('Error recording click:', error);
      return false;
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
