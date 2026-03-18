import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Use same type as hook
export type LocationState = {
    location: [number, number] | null;
    loading: boolean;
    error: string | null;
    requestLocation: () => void;
    setZipCodeLocation: (zipCode: string) => Promise<void>;
    locationSource: 'gps' | 'zip' | null;
    currentZip: string | null;
};

const LocationContext = createContext<LocationState | undefined>(undefined);

// Helper functions (moved from hook)
const getZipCodeCoordinates = async (zipCode: string): Promise<[number, number] | null> => {
    console.log('Looking up ZIP code:', zipCode);

    // 1. Try Zippopotam.us (Very reliable for US ZIPs)
    try {
        const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.places && data.places.length > 0) {
                const place = data.places[0];
                return [parseFloat(place.latitude), parseFloat(place.longitude)];
            }
        }
    } catch (error) {
        console.warn('Zippopotam API failed:', error);
    }

    // 2. Try OpenStreetMap Nominatim
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=US&format=json&limit=1`,
            { headers: { 'User-Agent': 'CommunityCompass/1.1' } }
        );
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                const result = data[0];
                return [parseFloat(result.lat), parseFloat(result.lon)];
            }
        }
    } catch (error) {
        console.warn('OpenStreetMap API failed:', error);
    }

    // 3. Last resort minimal fallback (Non-Boston default)
    const usZipMapping: Record<string, [number, number]> = {
        '10001': [40.7484, -73.9857], '90210': [34.0901, -118.4004],
        '60601': [41.8789, -87.6339], '33101': [25.7617, -80.1918],
        '98101': [47.6062, -122.3321], '02101': [42.3601, -71.0589],
    };
    return usZipMapping[zipCode] || null;
};

const getIpLocation = async (): Promise<[number, number] | null> => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
            const data = await response.json();
            if (data.latitude && data.longitude) {
                return [data.latitude, data.longitude];
            }
        }
    } catch (error) {
        console.warn('IP location fallback failed:', error);
    }
    return null;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [location, setLocation] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [source, setSource] = useState<'gps' | 'zip' | null>(null);
    const [currentZip, setCurrentZip] = useState<string | null>(null);

    const requestLocation = useCallback(() => {
        setLoading(true);
        setError(null);

        // Clear saved preference
        localStorage.removeItem('savedZip');
        setCurrentZip(null);

        if (!('geolocation' in navigator)) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc: [number, number] = [position.coords.latitude, position.coords.longitude];
                setLocation(loc);
                setSource('gps');
                setLoading(false);
                setError(null);
            },
            async () => {
                console.log('Browser geolocation failed, trying IP fallback...');
                const ipLoc = await getIpLocation();
                if (ipLoc) {
                    setLocation(ipLoc);
                    setSource('gps');
                    setLoading(false);
                    setError(null);
                } else {
                    setError('Location access denied. Please enable location services or enter a ZIP code to see local resources.');
                    setLoading(false);
                    setLocation(null);
                }
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }, []);

    const setZipCodeLocation = useCallback(async (zipCode: string) => {
        setLoading(true);
        setError(null);

        try {
            const coords = await getZipCodeCoordinates(zipCode);
            if (coords) {
                setLocation(coords);
                setSource('zip');
                setCurrentZip(zipCode);
                localStorage.setItem('savedZip', zipCode);
            } else {
                setError(`ZIP code ${zipCode} not found. Please check the ZIP code and try again.`);
            }
        } catch (error) {
            console.error('Error in setZipCodeLocation:', error);
            setError('Failed to look up ZIP code. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        const savedZip = localStorage.getItem('savedZip');
        if (savedZip) {
            setZipCodeLocation(savedZip);
        } else {
            requestLocation();
        }
    }, [requestLocation, setZipCodeLocation]);

    return (
        <LocationContext.Provider value={{
            location,
            loading,
            error,
            requestLocation,
            setZipCodeLocation,
            locationSource: source,
            currentZip
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}

// Keep export for calculateDistance
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
