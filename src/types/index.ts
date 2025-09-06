// User Types
export interface User {
  userId: string;
  fName: string;
  fUsername: string;
  preferredCuisines: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  savedLocations: SavedLocation[];
  isSubscribed: boolean;
  subscriptionTier: 'free' | 'premium';
  createdAt: string;
  updatedAt: string;
}

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

// Vendor Types
export interface Vendor {
  vendorId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  cuisineType: string;
  openingHours: string;
  contactInfo: string;
  website?: string;
  orderLink?: string;
  rating: number;
  priceRange: '$' | '$$' | '$$$';
  distance?: number;
  estimatedDeliveryTime?: number;
  isOpen: boolean;
  imageUrl?: string;
}

// Menu Item Types
export interface MenuItem {
  menuItemId: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  dietaryTags: string[];
  allergens: string[];
  imageUrl?: string;
  isAvailable: boolean;
  nutritionInfo?: NutritionInfo;
  preparationTime?: number;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

// Filter Types
export interface FilterOptions {
  cuisineTypes: string[];
  dietaryTags: string[];
  allergens: string[];
  priceRange: {
    min: number;
    max: number;
  };
  distance: number;
  isOpenNow: boolean;
  rating: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Subscription Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

// Meal Planning Types (Premium Feature)
export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  meals: PlannedMeal[];
  totalBudget: number;
  createdAt: string;
}

export interface PlannedMeal {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  menuItem: MenuItem;
  vendor: Vendor;
  notes?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'deal' | 'new_restaurant' | 'meal_reminder' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Search Types
export interface SearchFilters {
  query?: string;
  location: Location;
  radius: number;
  cuisineTypes?: string[];
  dietaryRestrictions?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  isOpenNow?: boolean;
  sortBy?: 'distance' | 'rating' | 'price' | 'delivery_time';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  vendors: Vendor[];
  menuItems: MenuItem[];
  totalResults: number;
  searchTime: number;
}
