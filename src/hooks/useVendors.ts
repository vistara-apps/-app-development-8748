import { useEffect, useCallback, useMemo } from 'react';
import { useVendorStore, useLocationStore, useUserStore } from '../store';
import { vendorService, menuService } from '../services/supabase';
import { mapsService } from '../services/maps';
import { Vendor, MenuItem, SearchFilters } from '../types';

export const useVendors = () => {
  const {
    vendors,
    menuItems,
    filteredVendors,
    isLoading,
    error,
    searchQuery,
    activeFilters,
    setVendors,
    setMenuItems,
    setFilteredVendors,
    setLoading,
    setError,
    setSearchQuery,
    setActiveFilters,
    clearFilters,
    refreshData
  } = useVendorStore();

  const { currentLocation } = useLocationStore();
  const { user } = useUserStore();

  // Load nearby vendors
  const loadNearbyVendors = useCallback(async (location = currentLocation, radius = 5) => {
    if (!location) {
      setError('Location is required to find nearby vendors');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get vendors from Supabase
      const nearbyVendors = await vendorService.getNearbyVendors(
        location.latitude,
        location.longitude,
        radius
      );

      // Calculate distances and add to vendor data
      const vendorsWithDistance = nearbyVendors.map(vendor => ({
        ...vendor,
        distance: mapsService.calculateDistance(
          location.latitude,
          location.longitude,
          vendor.latitude,
          vendor.longitude
        ),
        estimatedDeliveryTime: mapsService.estimateDeliveryTime(
          mapsService.calculateDistance(
            location.latitude,
            location.longitude,
            vendor.latitude,
            vendor.longitude
          )
        )
      }));

      // Sort by distance
      vendorsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setVendors(vendorsWithDistance);
      setFilteredVendors(vendorsWithDistance);

      // Load menu items for all vendors
      const allMenuItems: MenuItem[] = [];
      for (const vendor of vendorsWithDistance) {
        const items = await menuService.getMenuItems(vendor.vendorId);
        allMenuItems.push(...items);
      }
      setMenuItems(allMenuItems);

    } catch (error) {
      console.error('Error loading nearby vendors:', error);
      setError('Failed to load nearby restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentLocation, setVendors, setMenuItems, setFilteredVendors, setLoading, setError]);

  // Search vendors and menu items
  const searchVendors = useCallback(async (query: string, filters?: Partial<SearchFilters>) => {
    setLoading(true);
    setError(null);

    try {
      // Search vendors
      const searchedVendors = await vendorService.searchVendors(query, filters);
      
      // Search menu items
      const searchedMenuItems = await menuService.searchMenuItems(query, {
        dietaryTags: filters?.dietaryRestrictions,
        priceRange: filters?.priceRange
      });

      // Get unique vendors from menu item results
      const vendorIdsFromMenu = [...new Set(searchedMenuItems.map(item => item.vendorId))];
      const vendorsFromMenu = await Promise.all(
        vendorIdsFromMenu.map(id => vendorService.getVendor(id))
      );

      // Combine and deduplicate vendors
      const allVendors = [...searchedVendors];
      vendorsFromMenu.forEach(vendor => {
        if (vendor && !allVendors.find(v => v.vendorId === vendor.vendorId)) {
          allVendors.push(vendor);
        }
      });

      // Add distance information if location is available
      let vendorsWithDistance = allVendors;
      if (currentLocation) {
        vendorsWithDistance = allVendors.map(vendor => ({
          ...vendor,
          distance: mapsService.calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            vendor.latitude,
            vendor.longitude
          )
        }));
      }

      setVendors(vendorsWithDistance);
      setFilteredVendors(vendorsWithDistance);
      setMenuItems(searchedMenuItems);

    } catch (error) {
      console.error('Error searching vendors:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentLocation, setVendors, setMenuItems, setFilteredVendors, setLoading, setError]);

  // Apply filters to current vendors
  const applyFilters = useCallback(() => {
    let filtered = [...vendors];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(query) ||
        vendor.cuisineType.toLowerCase().includes(query) ||
        menuItems.some(item => 
          item.vendorId === vendor.vendorId &&
          (item.name.toLowerCase().includes(query) ||
           item.description.toLowerCase().includes(query))
        )
      );
    }

    // Apply cuisine type filter
    if (activeFilters.cuisineTypes.length > 0) {
      filtered = filtered.filter(vendor =>
        activeFilters.cuisineTypes.includes(vendor.cuisineType)
      );
    }

    // Apply dietary tags filter
    if (activeFilters.dietaryTags.length > 0) {
      filtered = filtered.filter(vendor => {
        const vendorMenuItems = menuItems.filter(item => item.vendorId === vendor.vendorId);
        return vendorMenuItems.some(item =>
          activeFilters.dietaryTags.some(tag => item.dietaryTags.includes(tag))
        );
      });
    }

    // Apply price range filter
    if (activeFilters.priceRange.min > 0 || activeFilters.priceRange.max < 100) {
      filtered = filtered.filter(vendor => {
        const vendorMenuItems = menuItems.filter(item => item.vendorId === vendor.vendorId);
        if (vendorMenuItems.length === 0) return false;
        
        const avgPrice = vendorMenuItems.reduce((sum, item) => sum + item.price, 0) / vendorMenuItems.length;
        return avgPrice >= activeFilters.priceRange.min && avgPrice <= activeFilters.priceRange.max;
      });
    }

    // Apply distance filter
    if (activeFilters.distance < 50 && currentLocation) {
      filtered = filtered.filter(vendor =>
        !vendor.distance || vendor.distance <= activeFilters.distance
      );
    }

    // Apply open now filter
    if (activeFilters.isOpenNow) {
      filtered = filtered.filter(vendor => vendor.isOpen);
    }

    // Apply rating filter
    if (activeFilters.rating > 0) {
      filtered = filtered.filter(vendor => vendor.rating >= activeFilters.rating);
    }

    setFilteredVendors(filtered);
  }, [vendors, menuItems, searchQuery, activeFilters, currentLocation, setFilteredVendors]);

  // Get menu items for a specific vendor
  const getVendorMenuItems = useCallback((vendorId: string): MenuItem[] => {
    return menuItems.filter(item => item.vendorId === vendorId);
  }, [menuItems]);

  // Get vendor by ID
  const getVendor = useCallback((vendorId: string): Vendor | undefined => {
    return vendors.find(vendor => vendor.vendorId === vendorId);
  }, [vendors]);

  // Get available cuisine types
  const availableCuisineTypes = useMemo(() => {
    const types = [...new Set(vendors.map(vendor => vendor.cuisineType))];
    return types.sort();
  }, [vendors]);

  // Get available dietary tags
  const availableDietaryTags = useMemo(() => {
    const tags = new Set<string>();
    menuItems.forEach(item => {
      item.dietaryTags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [menuItems]);

  // Auto-load vendors when location changes
  useEffect(() => {
    if (currentLocation && vendors.length === 0) {
      loadNearbyVendors();
    }
  }, [currentLocation, vendors.length, loadNearbyVendors]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    // State
    vendors,
    menuItems,
    filteredVendors,
    isLoading,
    error,
    searchQuery,
    activeFilters,
    
    // Computed
    availableCuisineTypes,
    availableDietaryTags,
    
    // Actions
    loadNearbyVendors,
    searchVendors,
    setSearchQuery,
    setActiveFilters,
    clearFilters,
    refreshData,
    getVendorMenuItems,
    getVendor,
    
    // Utilities
    formatPriceRange: (vendor: Vendor) => {
      const vendorItems = getVendorMenuItems(vendor.vendorId);
      if (vendorItems.length === 0) return '$';
      
      const avgPrice = vendorItems.reduce((sum, item) => sum + item.price, 0) / vendorItems.length;
      if (avgPrice < 15) return '$';
      if (avgPrice < 30) return '$$';
      return '$$$';
    },
    
    isVendorOpen: (vendor: Vendor) => {
      // This would typically check against current time and opening hours
      // For now, we'll use the isOpen field from the vendor data
      return vendor.isOpen;
    },
    
    getVendorDistance: (vendor: Vendor) => {
      if (!vendor.distance) return null;
      const miles = mapsService.kmToMiles(vendor.distance);
      return miles < 1 
        ? `${(miles * 5280).toFixed(0)} ft`
        : `${miles.toFixed(1)} mi`;
    }
  };
};
