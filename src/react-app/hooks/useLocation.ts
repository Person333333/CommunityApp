import { useState, useEffect, useCallback } from 'react';

export type LocationState = {
  location: [number, number] | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  setZipCodeLocation: (zipCode: string) => void;
  locationSource: 'gps' | 'zip' | null;
};

// Calculate distance between two coordinates in kilometers using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Simple ZIP code to coordinates mapping (for demo purposes)
const zipCodeCoordinates: Record<string, [number, number]> = {
  '10001': [40.7484, -73.9857], // New York, NY
  '90210': [34.0901, -118.4065], // Beverly Hills, CA
  '60601': [41.8781, -87.6298], // Chicago, IL
  '33101': [25.7617, -80.1918], // Miami, FL
  '98101': [47.6062, -122.3321], // Seattle, WA
  '02101': [42.3601, -71.0589], // Boston, MA
  '85001': [33.4484, -112.0740], // Phoenix, AZ
  '80202': [39.7392, -104.9903], // Denver, CO
  '77001': [29.7604, -95.3698], // Houston, TX
  '19101': [39.9526, -75.1652], // Philadelphia, PA
};

export function useLocation(): LocationState {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
        setLocation(loc);
        setLoading(false);
        setError(null);
      },
      () => {
        setError('Location access denied. Please enable location services to see local resources.');
        setLoading(false);
        setLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  const setZipCodeLocation = useCallback((zipCode: string) => {
    setLoading(true);
    setError(null);
    
    const coords = zipCodeCoordinates[zipCode];
    if (coords) {
      setLocation(coords);
      setLoading(false);
    } else {
      setError('ZIP code not found. Try another ZIP code.');
      setLoading(false);
    }
  }, []);

  // Request location immediately on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, loading, error, requestLocation, setZipCodeLocation, locationSource: location ? 'gps' : null };
}

