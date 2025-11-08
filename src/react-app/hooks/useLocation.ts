import { useState, useEffect, useCallback } from 'react';

export type LocationState = {
  location: [number, number] | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
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
      (err) => {
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

  // Request location immediately on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, loading, error, requestLocation };
}

