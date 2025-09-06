import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Vendor, MenuItem, Location, FilterOptions, Notification } from '../types';

// User Store
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  subscriptionStatus: any;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setSubscriptionStatus: (status: any) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      subscriptionStatus: null,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      setSubscriptionStatus: (status) => set({ subscriptionStatus: status }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        subscriptionStatus: null 
      })
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        subscriptionStatus: state.subscriptionStatus
      })
    }
  )
);

// Location Store
interface LocationState {
  currentLocation: Location | null;
  savedLocations: Location[];
  isLoadingLocation: boolean;
  locationError: string | null;
  setCurrentLocation: (location: Location | null) => void;
  addSavedLocation: (location: Location) => void;
  removeSavedLocation: (locationId: string) => void;
  setLocationLoading: (loading: boolean) => void;
  setLocationError: (error: string | null) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentLocation: null,
      savedLocations: [],
      isLoadingLocation: false,
      locationError: null,
      
      setCurrentLocation: (location) => set({ currentLocation: location }),
      
      addSavedLocation: (location) => set((state) => ({
        savedLocations: [...state.savedLocations, location]
      })),
      
      removeSavedLocation: (locationId) => set((state) => ({
        savedLocations: state.savedLocations.filter(loc => loc.name !== locationId)
      })),
      
      setLocationLoading: (loading) => set({ isLoadingLocation: loading }),
      
      setLocationError: (error) => set({ locationError: error })
    }),
    {
      name: 'location-storage',
      partialize: (state) => ({ 
        savedLocations: state.savedLocations,
        currentLocation: state.currentLocation
      })
    }
  )
);

// Vendors and Menu Store
interface VendorState {
  vendors: Vendor[];
  menuItems: MenuItem[];
  filteredVendors: Vendor[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  searchQuery: string;
  activeFilters: FilterOptions;
  setVendors: (vendors: Vendor[]) => void;
  setMenuItems: (items: MenuItem[]) => void;
  setFilteredVendors: (vendors: Vendor[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilters: (filters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  refreshData: () => void;
}

const defaultFilters: FilterOptions = {
  cuisineTypes: [],
  dietaryTags: [],
  allergens: [],
  priceRange: { min: 0, max: 100 },
  distance: 5,
  isOpenNow: false,
  rating: 0
};

export const useVendorStore = create<VendorState>((set, get) => ({
  vendors: [],
  menuItems: [],
  filteredVendors: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  searchQuery: '',
  activeFilters: defaultFilters,
  
  setVendors: (vendors) => set({ 
    vendors, 
    lastUpdated: new Date().toISOString() 
  }),
  
  setMenuItems: (items) => set({ menuItems: items }),
  
  setFilteredVendors: (vendors) => set({ filteredVendors: vendors }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setActiveFilters: (filters) => set((state) => ({
    activeFilters: { ...state.activeFilters, ...filters }
  })),
  
  clearFilters: () => set({ 
    activeFilters: defaultFilters,
    searchQuery: ''
  }),
  
  refreshData: () => set({ 
    lastUpdated: new Date().toISOString() 
  })
}));

// Notifications Store
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadCount });
  },
  
  addNotification: (notification) => set((state) => {
    const newNotifications = [notification, ...state.notifications];
    const unreadCount = newNotifications.filter(n => !n.isRead).length;
    return { notifications: newNotifications, unreadCount };
  }),
  
  markAsRead: (notificationId) => set((state) => {
    const notifications = state.notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return { notifications, unreadCount };
  }),
  
  markAllAsRead: () => set((state) => {
    const notifications = state.notifications.map(n => ({ ...n, isRead: true }));
    return { notifications, unreadCount: 0 };
  }),
  
  removeNotification: (notificationId) => set((state) => {
    const notifications = state.notifications.filter(n => n.id !== notificationId);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return { notifications, unreadCount };
  }),
  
  setLoading: (loading) => set({ isLoading: loading })
}));

// App State Store (for UI state, preferences, etc.)
interface AppState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  currentView: 'map' | 'list' | 'grid';
  isOnline: boolean;
  lastSync: string | null;
  preferences: {
    showNotifications: boolean;
    autoLocation: boolean;
    defaultRadius: number;
    preferredView: 'map' | 'list' | 'grid';
  };
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: 'map' | 'list' | 'grid') => void;
  setOnlineStatus: (online: boolean) => void;
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void;
  setLastSync: (timestamp: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      sidebarOpen: false,
      currentView: 'grid',
      isOnline: navigator.onLine,
      lastSync: null,
      preferences: {
        showNotifications: true,
        autoLocation: true,
        defaultRadius: 5,
        preferredView: 'grid'
      },
      
      setTheme: (theme) => set({ theme }),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setCurrentView: (view) => set({ currentView: view }),
      
      setOnlineStatus: (online) => set({ isOnline: online }),
      
      updatePreferences: (newPreferences) => set((state) => ({
        preferences: { ...state.preferences, ...newPreferences }
      })),
      
      setLastSync: (timestamp) => set({ lastSync: timestamp })
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        theme: state.theme,
        currentView: state.currentView,
        preferences: state.preferences
      })
    }
  )
);

// Meal Planning Store (Premium Feature)
interface MealPlanState {
  currentPlan: any | null;
  savedPlans: any[];
  isGenerating: boolean;
  generationError: string | null;
  setCurrentPlan: (plan: any | null) => void;
  addSavedPlan: (plan: any) => void;
  removeSavedPlan: (planId: string) => void;
  setGenerating: (generating: boolean) => void;
  setGenerationError: (error: string | null) => void;
}

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      savedPlans: [],
      isGenerating: false,
      generationError: null,
      
      setCurrentPlan: (plan) => set({ currentPlan: plan }),
      
      addSavedPlan: (plan) => set((state) => ({
        savedPlans: [...state.savedPlans, plan]
      })),
      
      removeSavedPlan: (planId) => set((state) => ({
        savedPlans: state.savedPlans.filter(p => p.id !== planId)
      })),
      
      setGenerating: (generating) => set({ isGenerating: generating }),
      
      setGenerationError: (error) => set({ generationError: error })
    }),
    {
      name: 'meal-plan-storage',
      partialize: (state) => ({ 
        savedPlans: state.savedPlans
      })
    }
  )
);

// Combined store hook for convenience
export const useStore = () => ({
  user: useUserStore(),
  location: useLocationStore(),
  vendor: useVendorStore(),
  notification: useNotificationStore(),
  app: useAppStore(),
  mealPlan: useMealPlanStore()
});
