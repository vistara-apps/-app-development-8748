import React, { useState, useEffect } from 'react';
import { MapPin, Search, Filter, Star, Clock, DollarSign, User, Settings, Bell } from 'lucide-react';
import AppShell from './components/AppShell';
import LocationCard from './components/LocationCard';
import FilterTags from './components/FilterTags';
import CallToActionButton from './components/CallToActionButton';
import LoadingSpinner from './components/LoadingSpinner';
import { mockVendors, mockMenuItems } from './data/mockData';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Simulate location detection and data loading
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate getting user location
      setTimeout(() => {
        setUserLocation({ lat: 40.7128, lng: -74.0060, name: "New York, NY" });
        setVendors(mockVendors);
        setFilteredVendors(mockVendors);
        setIsLoading(false);
      }, 2000);
    };

    loadData();
  }, []);

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    
    if (filters.length === 0) {
      setFilteredVendors(vendors);
      return;
    }

    const filtered = vendors.filter(vendor => {
      return filters.some(filter => {
        // Check if vendor has items matching the filter
        const vendorItems = mockMenuItems.filter(item => item.vendorId === vendor.vendorId);
        return vendorItems.some(item => 
          item.dietaryTags.includes(filter) || 
          vendor.cuisineType.toLowerCase().includes(filter.toLowerCase())
        );
      });
    });

    setFilteredVendors(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen text-white">
        {/* Hero Section */}
        <div className="relative px-4 pt-8 pb-16 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">LocalBites</h1>
                <p className="text-lg text-gray-200">Discover, Plan, and Savor Meals Near You</p>
              </div>
              <div className="flex items-center space-x-4">
                <CallToActionButton
                  variant={isSubscribed ? "outline" : "primary"}
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className="whitespace-nowrap"
                >
                  {isSubscribed ? "Premium" : "Upgrade"}
                </CallToActionButton>
                <button className="p-2 glass-card rounded-lg">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Location Display */}
            {userLocation && (
              <div className="glass-card rounded-xl p-6 mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <span className="text-lg font-medium">{userLocation.name}</span>
                </div>
                <p className="text-gray-300">Showing restaurants within 2 miles</p>
              </div>
            )}

            {/* Filter Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="text-xl font-semibold mb-2 sm:mb-0">Filter Your Preferences</h2>
                <div className="text-sm text-gray-300">
                  {filteredVendors.length} restaurants found
                </div>
              </div>
              <FilterTags
                onFilterChange={handleFilterChange}
                selectedFilters={selectedFilters}
              />
            </div>

            {/* Vendors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredVendors.map(vendor => (
                <LocationCard
                  key={vendor.vendorId}
                  vendor={vendor}
                  variant="withImage"
                  menuItems={mockMenuItems.filter(item => item.vendorId === vendor.vendorId)}
                />
              ))}
            </div>

            {/* Subscription CTA */}
            {!isSubscribed && (
              <div className="glass-card rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Unlock Premium Features</h3>
                <p className="text-gray-300 mb-6">
                  Get personalized meal planning, priority support, and exclusive restaurant deals
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">$5</div>
                    <div className="text-sm text-gray-400">per month</div>
                  </div>
                  <CallToActionButton
                    variant="primary"
                    onClick={() => setIsSubscribed(true)}
                    className="px-8 py-3"
                  >
                    Start Free Trial
                  </CallToActionButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default App;