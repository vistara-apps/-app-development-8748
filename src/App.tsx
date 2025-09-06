import React, { useState, useEffect } from 'react';
import { MapPin, Search, Filter, Star, Clock, DollarSign, User, Settings, Bell, Sparkles } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import AppShell from './components/AppShell';
import LocationCard from './components/LocationCard';
import FilterTags from './components/FilterTags';
import CallToActionButton from './components/CallToActionButton';
import LoadingSpinner from './components/LoadingSpinner';
import { useLocation } from './hooks/useLocation';
import { useVendors } from './hooks/useVendors';
import { useUserStore, useAppStore } from './store';
import { stripeService } from './services/stripe';
import { openAIService } from './services/openai';

function App() {
  // Hooks
  const { 
    currentLocation, 
    isLoadingLocation, 
    locationError, 
    getCurrentLocation 
  } = useLocation();
  
  const {
    filteredVendors,
    isLoading: isLoadingVendors,
    error: vendorsError,
    searchQuery,
    setSearchQuery,
    activeFilters,
    setActiveFilters,
    availableCuisineTypes,
    availableDietaryTags,
    getVendorMenuItems
  } = useVendors();

  // Store state
  const { user, isAuthenticated, subscriptionStatus } = useUserStore();
  const { currentView, setCurrentView } = useAppStore();

  // Local state
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);

  // Check if user has premium features
  const isPremiumUser = stripeService.isPremiumUser(subscriptionStatus);
  const featureAvailability = stripeService.getFeatureAvailability(subscriptionStatus);

  // Loading state
  const isLoading = isLoadingLocation || isLoadingVendors;

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      // Get location if not already available
      if (!currentLocation) {
        await getCurrentLocation();
      }

      // Generate search suggestions if user is available
      if (user && currentLocation) {
        try {
          const suggestions = await openAIService.generateSearchSuggestions(
            user,
            currentLocation.address || 'Current Location',
            new Date().toLocaleTimeString()
          );
          setSearchSuggestions(suggestions);
        } catch (error) {
          console.error('Error generating search suggestions:', error);
        }
      }
    };

    initializeApp();
  }, [currentLocation, user, getCurrentLocation]);

  // Handle filter changes
  const handleFilterChange = (filters: string[]) => {
    setActiveFilters({
      dietaryTags: filters.filter(f => availableDietaryTags.includes(f)),
      cuisineTypes: filters.filter(f => availableCuisineTypes.includes(f))
    });
  };

  // Handle subscription upgrade
  const handleSubscriptionUpgrade = async () => {
    if (!user) {
      // Handle user authentication first
      console.log('User needs to sign in first');
      return;
    }

    try {
      const session = await stripeService.createCheckoutSession(
        'premium',
        user.userId,
        `${window.location.origin}/success`,
        `${window.location.origin}/cancel`
      );

      if (session) {
        await stripeService.redirectToCheckout(session.sessionId);
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };

  // Generate AI recommendations (Premium feature)
  const generateAIRecommendations = async () => {
    if (!user || !featureAvailability.aiRecommendations) {
      return;
    }

    setShowAIRecommendations(true);
    
    try {
      const recommendations = await openAIService.generateMealRecommendations(
        user,
        filteredVendors,
        filteredVendors.flatMap(v => getVendorMenuItems(v.vendorId)),
        {
          timeOfDay: new Date().toLocaleTimeString(),
          weather: 'Clear' // This would come from a weather API
        }
      );
      
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
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
                  {featureAvailability.aiRecommendations && (
                    <CallToActionButton
                      variant="outline"
                      onClick={generateAIRecommendations}
                      className="whitespace-nowrap flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>AI Picks</span>
                    </CallToActionButton>
                  )}
                  <CallToActionButton
                    variant={isPremiumUser ? "outline" : "primary"}
                    onClick={handleSubscriptionUpgrade}
                    className="whitespace-nowrap"
                  >
                    {isPremiumUser ? "Premium" : "Upgrade"}
                  </CallToActionButton>
                  <button className="p-2 glass-card rounded-lg">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Location Display */}
              {currentLocation && (
                <div className="glass-card rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-green-400" />
                      <div>
                        <span className="text-lg font-medium">
                          {currentLocation.name || currentLocation.address}
                        </span>
                        <p className="text-gray-300 text-sm">
                          Showing restaurants within {activeFilters.distance} km
                        </p>
                      </div>
                    </div>
                    <CallToActionButton
                      variant="outline"
                      onClick={getCurrentLocation}
                      className="text-sm"
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? 'Updating...' : 'Update Location'}
                    </CallToActionButton>
                  </div>
                </div>
              )}

              {/* Location Error */}
              {locationError && (
                <div className="glass-card rounded-xl p-4 mb-8 border-red-500/20 bg-red-500/10">
                  <p className="text-red-300 text-sm">{locationError}</p>
                </div>
              )}

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for restaurants, cuisines, or dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 glass-card rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                {/* Search Suggestions */}
                {searchSuggestions.length > 0 && !searchQuery && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-400 mb-2">Suggested searches:</p>
                    <div className="flex flex-wrap gap-2">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(suggestion)}
                          className="px-3 py-1 text-sm glass-card rounded-full hover:bg-white/20 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
                  selectedFilters={[...activeFilters.dietaryTags, ...activeFilters.cuisineTypes]}
                  availableOptions={[...availableDietaryTags, ...availableCuisineTypes]}
                />
              </div>

              {/* AI Recommendations */}
              {showAIRecommendations && aiRecommendations && (
                <div className="glass-card rounded-xl p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span>AI Recommendations for You</span>
                  </h3>
                  <p className="text-gray-300 mb-4">{aiRecommendations.explanation}</p>
                  <button
                    onClick={() => setShowAIRecommendations(false)}
                    className="text-sm text-gray-400 hover:text-white"
                  >
                    Hide recommendations
                  </button>
                </div>
              )}

              {/* Vendors Error */}
              {vendorsError && (
                <div className="glass-card rounded-xl p-4 mb-8 border-red-500/20 bg-red-500/10">
                  <p className="text-red-300 text-sm">{vendorsError}</p>
                </div>
              )}

              {/* Vendors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {filteredVendors.map(vendor => (
                  <LocationCard
                    key={vendor.vendorId}
                    vendor={vendor}
                    variant="withImage"
                    menuItems={getVendorMenuItems(vendor.vendorId)}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredVendors.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-semibold mb-2">No restaurants found</h3>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your filters or search in a different area
                  </p>
                  <CallToActionButton
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFilters({
                        cuisineTypes: [],
                        dietaryTags: [],
                        allergens: [],
                        priceRange: { min: 0, max: 100 },
                        distance: 5,
                        isOpenNow: false,
                        rating: 0
                      });
                    }}
                  >
                    Clear Filters
                  </CallToActionButton>
                </div>
              )}

              {/* Subscription CTA */}
              {!isPremiumUser && (
                <div className="glass-card rounded-xl p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Unlock Premium Features</h3>
                  <p className="text-gray-300 mb-6">
                    Get AI-powered recommendations, advanced meal planning, and exclusive restaurant deals
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                      <h4 className="font-semibold mb-1">AI Recommendations</h4>
                      <p className="text-sm text-gray-400">Personalized meal suggestions</p>
                    </div>
                    <div className="text-center">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                      <h4 className="font-semibold mb-1">Meal Planning</h4>
                      <p className="text-sm text-gray-400">Weekly meal schedules</p>
                    </div>
                    <div className="text-center">
                      <Star className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      <h4 className="font-semibold mb-1">Exclusive Deals</h4>
                      <p className="text-sm text-gray-400">Special restaurant offers</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">$5</div>
                      <div className="text-sm text-gray-400">per month</div>
                    </div>
                    <CallToActionButton
                      variant="primary"
                      onClick={handleSubscriptionUpgrade}
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
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
          },
        }}
      />
    </>
  );
}

export default App;
