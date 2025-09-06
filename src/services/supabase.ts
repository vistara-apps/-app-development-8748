import { createClient } from '@supabase/supabase-js';
import { User, Vendor, MenuItem, MealPlan, Notification } from '../types';

// Environment variables - these should be set in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// User Management
export const userService = {
  async getUser(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('userId', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...user,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('userId', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }
};

// Vendor Management
export const vendorService = {
  async getNearbyVendors(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 5
  ): Promise<Vendor[]> {
    try {
      // Using PostGIS extension for geospatial queries
      const { data, error } = await supabase
        .rpc('get_nearby_vendors', {
          lat: latitude,
          lng: longitude,
          radius_km: radiusKm
        });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching nearby vendors:', error);
      return [];
    }
  },

  async getVendor(vendorId: string): Promise<Vendor | null> {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendorId', vendorId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      return null;
    }
  },

  async searchVendors(query: string, filters?: any): Promise<Vendor[]> {
    try {
      let queryBuilder = supabase
        .from('vendors')
        .select('*');

      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,cuisineType.ilike.%${query}%`);
      }

      if (filters?.cuisineTypes?.length) {
        queryBuilder = queryBuilder.in('cuisineType', filters.cuisineTypes);
      }

      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching vendors:', error);
      return [];
    }
  }
};

// Menu Item Management
export const menuService = {
  async getMenuItems(vendorId: string): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendorId', vendorId)
        .eq('isAvailable', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  },

  async searchMenuItems(
    query: string, 
    filters?: {
      dietaryTags?: string[];
      allergens?: string[];
      priceRange?: { min: number; max: number };
    }
  ): Promise<MenuItem[]> {
    try {
      let queryBuilder = supabase
        .from('menu_items')
        .select('*')
        .eq('isAvailable', true);

      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (filters?.dietaryTags?.length) {
        queryBuilder = queryBuilder.overlaps('dietaryTags', filters.dietaryTags);
      }

      if (filters?.priceRange) {
        queryBuilder = queryBuilder
          .gte('price', filters.priceRange.min)
          .lte('price', filters.priceRange.max);
      }

      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching menu items:', error);
      return [];
    }
  }
};

// Meal Planning (Premium Feature)
export const mealPlanService = {
  async getMealPlans(userId: string): Promise<MealPlan[]> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meals:planned_meals(
            *,
            menuItem:menu_items(*),
            vendor:vendors(*)
          )
        `)
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      return [];
    }
  },

  async createMealPlan(mealPlan: Omit<MealPlan, 'id' | 'createdAt'>): Promise<MealPlan | null> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert([{
          ...mealPlan,
          createdAt: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating meal plan:', error);
      return null;
    }
  }
};

// Notifications
export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ isRead: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
};

// Real-time subscriptions
export const subscribeToVendorUpdates = (callback: (payload: any) => void) => {
  return supabase
    .channel('vendor-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'vendors' }, 
      callback
    )
    .subscribe();
};

export const subscribeToMenuUpdates = (vendorId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`menu-updates-${vendorId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'menu_items',
        filter: `vendorId=eq.${vendorId}`
      }, 
      callback
    )
    .subscribe();
};
