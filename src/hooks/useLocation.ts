import { useEffect, useCallback } from 'react';
import { useLocationStore } from '../store';
import { mapsService } from '../services/maps';
import { Location } from '../types';

export const useLocation = () => {
  const {
    currentLocation,
    savedLocations,
    isLoadingLocation,
    locationError,
    setCurrentLocation,
    addSavedLocation,
    removeSavedLocation,
    setLocationLoading,
    setLocationError
  } = useLocationStore();

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const location = await mapsService.getCurrentLocation();
      if (location) {
        // Get address for the location
        const address = await mapsService.reverseGeocode(
          location.latitude,
          location.longitude
        );
        
        const locationWithAddress = {
          ...location,
          address: address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
        };
        
        setCurrentLocation(locationWithAddress);
      } else {
        setLocationError('Unable to get your location. Please check your browser settings.');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Failed to get your location. Using default location.');
      
      // Set default location (New York City)
      setCurrentLocation({
        latitude: 40.7128,
        longitude: -74.0060,
        name: 'New York, NY (Default)',
        address: 'New York, NY, USA'
      });
    } finally {
      setLocationLoading(false);
    }
  }, [setCurrentLocation, setLocationLoading, setLocationError]);

  // Geocode an address
  const geocodeAddress = useCallback(async (address: string): Promise<Location | null> => {
    try {
      const location = await mapsService.geocode(address);
      return location;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }, []);

  // Save a location
  const saveLocation = useCallback((location: Location, name?: string) => {
    const locationToSave = {
      ...location,
      name: name || location.address || 'Saved Location'
    };
    addSavedLocation(locationToSave);
  }, [addSavedLocation]);

  // Remove a saved location
  const removeSavedLocationById = useCallback((locationId: string) => {
    removeSavedLocation(locationId);
  }, [removeSavedLocation]);

  // Calculate distance between two locations
  const calculateDistance = useCallback((
    location1: Location,
    location2: Location
  ): number => {
    return mapsService.calculateDistance(
      location1.latitude,
      location1.longitude,
      location2.latitude,
      location2.longitude
    );
  }, []);

  // Check if location permission is granted
  const checkLocationPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.permissions) {
      return false;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }, []);

  // Auto-get location on mount if permission is granted
  useEffect(() => {
    const autoGetLocation = async () => {
      if (!currentLocation) {
        const hasPermission = await checkLocationPermission();
        if (hasPermission) {
          getCurrentLocation();
        }
      }
    };

    autoGetLocation();
  }, [currentLocation, getCurrentLocation, checkLocationPermission]);

  return {
    // State
    currentLocation,
    savedLocations,
    isLoadingLocation,
    locationError,
    
    // Actions
    getCurrentLocation,
    geocodeAddress,
    saveLocation,
    removeSavedLocationById,
    calculateDistance,
    checkLocationPermission,
    
    // Utilities
    formatDistance: (distanceKm: number) => {
      const miles = mapsService.kmToMiles(distanceKm);
      return miles < 1 
        ? `${(miles * 5280).toFixed(0)} ft`
        : `${miles.toFixed(1)} mi`;
    },
    
    estimateDeliveryTime: (distanceKm: number) => {
      return mapsService.estimateDeliveryTime(distanceKm);
    }
  };
};
