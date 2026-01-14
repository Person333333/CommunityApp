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

// ZIP code to coordinates using multiple APIs (free, worldwide)
const getZipCodeCoordinates = async (zipCode: string): Promise<[number, number] | null> => {
  console.log('Looking up ZIP code:', zipCode);

  // Try ZipCodeAPI.com first (US only, very reliable)
  try {
    const response = await fetch(`https://www.zipcodeapi.com/rest/DemoAPI/info.json/${zipCode}/degrees`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.lat && data.lng) {
        console.log('ZipCodeAPI result:', [data.lat, data.lng]);
        return [parseFloat(data.lat), parseFloat(data.lng)];
      }
    }
  } catch (error) {
    console.warn('ZipCodeAPI failed:', error);
  }

  // Try OpenStreetMap Nominatim (worldwide)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'CommunityCompass/1.0'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        console.log('OpenStreetMap result:', [parseFloat(result.lat), parseFloat(result.lon)]);
        return [parseFloat(result.lat), parseFloat(result.lon)];
      }
    }
  } catch (error) {
    console.warn('OpenStreetMap API failed:', error);
  }

  // Fallback: Try Zippopotam.us API
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.places && data.places.length > 0) {
        const place = data.places[0];
        console.log('Zippopotam result:', [parseFloat(place.latitude), parseFloat(place.longitude)]);
        return [parseFloat(place.latitude), parseFloat(place.longitude)];
      }
    }
  } catch (error) {
    console.warn('Zippopotam API failed:', error);
  }

  // Final fallback: Try a simple US ZIP code mapping for common codes
  const usZipMapping: Record<string, [number, number]> = {
    '10001': [40.7484, -73.9857], // New York, NY
    '90210': [34.0901, -118.4065], // Beverly Hills, CA
    '60601': [41.8789, -87.6339], // Chicago, IL
    '33101': [25.7617, -80.1918], // Miami, FL
    '98101': [47.6062, -122.3321], // Seattle, WA
    '02101': [42.3601, -71.0589], // Boston, MA
    '85001': [33.4484, -112.0740], // Phoenix, AZ
    '80201': [39.7392, -104.9903], // Denver, CO
    '77001': [29.7604, -95.3698], // Houston, TX
    '75201': [32.7767, -96.7970], // Dallas, TX
    '98011': [47.7597, -122.1913], // Bothell, WA
    '98052': [47.6769, -122.1240], // Redmond, WA
  };

  const fallback = usZipMapping[zipCode];
  if (fallback) {
    console.log(`Using fallback coordinates for ZIP ${zipCode}:`, fallback);
    return fallback;
  }

  console.log('No coordinates found for ZIP:', zipCode);
  return null;
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

  const setZipCodeLocation = useCallback(async (zipCode: string) => {
    console.log('setZipCodeLocation called with:', zipCode);
    setLoading(true);
    setError(null);
    
    try {
      console.log('Calling getZipCodeCoordinates...');
      const coords = await getZipCodeCoordinates(zipCode);
      console.log('Got coordinates:', coords);
      if (coords) {
        setLocation(coords);
        console.log(`ZIP Code ${zipCode} set to location: ${coords}`);
      } else {
        console.log('No coordinates found for ZIP:', zipCode);
        setError(`ZIP code ${zipCode} not found. Please check the ZIP code and try again.`);
      }
    } catch (error) {
      console.error('Error in setZipCodeLocation:', error);
      setError('Failed to look up ZIP code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Request location immediately on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, loading, error, requestLocation, setZipCodeLocation, locationSource: location ? 'gps' : null };
}

