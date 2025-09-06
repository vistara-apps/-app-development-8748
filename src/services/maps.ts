import { Location } from '../types';

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  price_level?: number;
  types: string[];
  opening_hours?: {
    open_now: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

export interface NearbySearchParams {
  location: Location;
  radius: number;
  type?: string;
  keyword?: string;
  minprice?: number;
  maxprice?: number;
  opennow?: boolean;
}

class MapsService {
  private apiKey: string;

  constructor() {
    this.apiKey = GOOGLE_MAPS_API_KEY;
    if (!this.apiKey) {
      console.warn('Google Maps API key not found. Location services will use fallback methods.');
    }
  }

  // Get current user location using browser geolocation
  async getCurrentLocation(): Promise<Location | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser.');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to default location (New York City)
          resolve({
            latitude: 40.7128,
            longitude: -74.0060,
            name: 'New York, NY (Default)'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Reverse geocoding - get address from coordinates
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    if (!this.apiKey) {
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }

    try {
      const response = await fetch(
        `${GEOCODING_API_URL}?latlng=${latitude},${longitude}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      
      return null;
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      return null;
    }
  }

  // Forward geocoding - get coordinates from address
  async geocode(address: string): Promise<Location | null> {
    if (!this.apiKey) {
      console.warn('Cannot geocode without API key');
      return null;
    }

    try {
      const response = await fetch(
        `${GEOCODING_API_URL}?address=${encodeURIComponent(address)}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          address: result.formatted_address
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error in geocoding:', error);
      return null;
    }
  }

  // Search for nearby restaurants using Places API
  async searchNearbyRestaurants(params: NearbySearchParams): Promise<PlaceResult[]> {
    if (!this.apiKey) {
      console.warn('Cannot search places without API key');
      return [];
    }

    try {
      const searchParams = new URLSearchParams({
        location: `${params.location.latitude},${params.location.longitude}`,
        radius: params.radius.toString(),
        type: params.type || 'restaurant',
        key: this.apiKey
      });

      if (params.keyword) {
        searchParams.append('keyword', params.keyword);
      }
      if (params.minprice !== undefined) {
        searchParams.append('minprice', params.minprice.toString());
      }
      if (params.maxprice !== undefined) {
        searchParams.append('maxprice', params.maxprice.toString());
      }
      if (params.opennow) {
        searchParams.append('opennow', 'true');
      }

      const response = await fetch(
        `${PLACES_API_URL}/nearbysearch/json?${searchParams.toString()}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.results;
      }
      
      console.error('Places API error:', data.status, data.error_message);
      return [];
    } catch (error) {
      console.error('Error searching nearby restaurants:', error);
      return [];
    }
  }

  // Get place details by place_id
  async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    if (!this.apiKey) {
      console.warn('Cannot get place details without API key');
      return null;
    }

    try {
      const response = await fetch(
        `${PLACES_API_URL}/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,price_level,opening_hours,photos,formatted_phone_number,website&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.result;
      }
      
      console.error('Place details API error:', data.status, data.error_message);
      return null;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  // Get photo URL from photo reference
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    if (!this.apiKey) {
      return '';
    }
    
    return `${PLACES_API_URL}/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Convert distance to miles
  kmToMiles(km: number): number {
    return km * 0.621371;
  }

  // Estimate delivery time based on distance
  estimateDeliveryTime(distanceKm: number): number {
    // Base time + time based on distance
    const baseTime = 15; // 15 minutes base
    const timePerKm = 3; // 3 minutes per km
    return Math.round(baseTime + (distanceKm * timePerKm));
  }

  // Check if a location is within a certain radius
  isWithinRadius(
    centerLat: number,
    centerLng: number,
    pointLat: number,
    pointLng: number,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(centerLat, centerLng, pointLat, pointLng);
    return distance <= radiusKm;
  }
}

export const mapsService = new MapsService();
export default mapsService;
