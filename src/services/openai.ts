import OpenAI from 'openai';
import { User, Vendor, MenuItem } from '../types';

// OpenAI configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    if (OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
      });
    } else {
      console.warn('OpenAI API key not found. AI features will be disabled.');
    }
  }

  // Generate personalized meal recommendations
  async generateMealRecommendations(
    user: User,
    availableVendors: Vendor[],
    menuItems: MenuItem[],
    context?: {
      timeOfDay?: string;
      weather?: string;
      previousOrders?: string[];
    }
  ): Promise<{
    recommendations: Array<{
      vendor: Vendor;
      menuItem: MenuItem;
      reason: string;
      confidence: number;
    }>;
    explanation: string;
  } | null> {
    if (!this.client) {
      return null;
    }

    try {
      const prompt = this.buildRecommendationPrompt(user, availableVendors, menuItems, context);
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful food recommendation assistant. Provide personalized meal suggestions based on user preferences, dietary restrictions, and available options. Always consider health, taste preferences, and budget constraints.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        return null;
      }

      return this.parseRecommendationResponse(aiResponse, availableVendors, menuItems);
    } catch (error) {
      console.error('Error generating meal recommendations:', error);
      return null;
    }
  }

  // Generate explanation for why a specific dish is recommended
  async explainRecommendation(
    user: User,
    vendor: Vendor,
    menuItem: MenuItem
  ): Promise<string | null> {
    if (!this.client) {
      return null;
    }

    try {
      const prompt = `
        User Profile:
        - Dietary restrictions: ${user.dietaryRestrictions.join(', ') || 'None'}
        - Preferred cuisines: ${user.preferredCuisines.join(', ') || 'Any'}
        - Allergies: ${user.allergies.join(', ') || 'None'}
        - Budget range: $${user.budgetRange.min}-${user.budgetRange.max}

        Recommended Item:
        - Restaurant: ${vendor.name}
        - Dish: ${menuItem.name}
        - Description: ${menuItem.description}
        - Price: $${menuItem.price}
        - Dietary tags: ${menuItem.dietaryTags.join(', ') || 'None'}

        Explain in 2-3 sentences why this dish is a great match for this user. Be specific about how it aligns with their preferences and dietary needs.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a food recommendation expert. Provide clear, concise explanations for why specific dishes match user preferences.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.6
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('Error explaining recommendation:', error);
      return null;
    }
  }

  // Generate meal plan suggestions (Premium feature)
  async generateMealPlan(
    user: User,
    duration: number, // days
    budget: number,
    availableVendors: Vendor[],
    menuItems: MenuItem[]
  ): Promise<{
    plan: Array<{
      day: number;
      meals: Array<{
        type: 'breakfast' | 'lunch' | 'dinner';
        vendor: Vendor;
        menuItem: MenuItem;
        reason: string;
      }>;
      dailyBudget: number;
    }>;
    totalCost: number;
    nutritionSummary: string;
  } | null> {
    if (!this.client) {
      return null;
    }

    try {
      const prompt = `
        Create a ${duration}-day meal plan for a user with the following preferences:
        
        User Profile:
        - Dietary restrictions: ${user.dietaryRestrictions.join(', ') || 'None'}
        - Preferred cuisines: ${user.preferredCuisines.join(', ') || 'Any'}
        - Allergies: ${user.allergies.join(', ') || 'None'}
        - Total budget: $${budget}
        - Daily budget: $${(budget / duration).toFixed(2)}

        Available restaurants and menu items:
        ${this.formatVendorsAndMenuItems(availableVendors, menuItems)}

        Create a balanced meal plan that:
        1. Stays within budget
        2. Respects dietary restrictions and allergies
        3. Provides nutritional variety
        4. Includes preferred cuisines when possible
        5. Balances convenience and health

        Format the response as JSON with the structure:
        {
          "plan": [
            {
              "day": 1,
              "meals": [
                {
                  "type": "breakfast",
                  "vendorId": "vendor_id",
                  "menuItemId": "item_id",
                  "reason": "explanation"
                }
              ],
              "dailyBudget": 25.00
            }
          ],
          "totalCost": 150.00,
          "nutritionSummary": "Brief nutrition overview"
        }
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a meal planning expert. Create balanced, budget-conscious meal plans that respect dietary restrictions and preferences.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const aiResponse = response.choices[0]?.message?.content;
      if (!aiResponse) {
        return null;
      }

      return this.parseMealPlanResponse(aiResponse, availableVendors, menuItems);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      return null;
    }
  }

  // Generate smart search suggestions
  async generateSearchSuggestions(
    user: User,
    currentLocation: string,
    timeOfDay: string
  ): Promise<string[]> {
    if (!this.client) {
      return this.getFallbackSearchSuggestions(timeOfDay);
    }

    try {
      const prompt = `
        Generate 5 food search suggestions for a user based on:
        - Location: ${currentLocation}
        - Time: ${timeOfDay}
        - Dietary restrictions: ${user.dietaryRestrictions.join(', ') || 'None'}
        - Preferred cuisines: ${user.preferredCuisines.join(', ') || 'Any'}
        
        Provide practical, specific search terms that would help them find relevant food options.
        Return only the search terms, one per line.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a food search assistant. Generate relevant, practical search suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      });

      const suggestions = response.choices[0]?.message?.content
        ?.split('\n')
        .filter(line => line.trim())
        .slice(0, 5) || [];

      return suggestions.length > 0 ? suggestions : this.getFallbackSearchSuggestions(timeOfDay);
    } catch (error) {
      console.error('Error generating search suggestions:', error);
      return this.getFallbackSearchSuggestions(timeOfDay);
    }
  }

  private buildRecommendationPrompt(
    user: User,
    vendors: Vendor[],
    menuItems: MenuItem[],
    context?: any
  ): string {
    return `
      User Profile:
      - Name: ${user.fName}
      - Dietary restrictions: ${user.dietaryRestrictions.join(', ') || 'None'}
      - Preferred cuisines: ${user.preferredCuisines.join(', ') || 'Any'}
      - Allergies: ${user.allergies.join(', ') || 'None'}
      - Budget range: $${user.budgetRange.min}-${user.budgetRange.max}

      Context:
      - Time of day: ${context?.timeOfDay || 'Not specified'}
      - Weather: ${context?.weather || 'Not specified'}

      Available options:
      ${this.formatVendorsAndMenuItems(vendors, menuItems)}

      Recommend 3-5 dishes that best match this user's preferences. For each recommendation, explain why it's a good fit.
    `;
  }

  private formatVendorsAndMenuItems(vendors: Vendor[], menuItems: MenuItem[]): string {
    return vendors.map(vendor => {
      const vendorItems = menuItems.filter(item => item.vendorId === vendor.vendorId);
      const itemsList = vendorItems.map(item => 
        `  - ${item.name}: $${item.price} (${item.dietaryTags.join(', ') || 'No special tags'})`
      ).join('\n');
      
      return `${vendor.name} (${vendor.cuisineType}):\n${itemsList}`;
    }).join('\n\n');
  }

  private parseRecommendationResponse(
    response: string,
    vendors: Vendor[],
    menuItems: MenuItem[]
  ): any {
    // This is a simplified parser - in production, you'd want more robust parsing
    return {
      recommendations: [],
      explanation: response
    };
  }

  private parseMealPlanResponse(
    response: string,
    vendors: Vendor[],
    menuItems: MenuItem[]
  ): any {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Error parsing meal plan response:', error);
      return null;
    }
  }

  private getFallbackSearchSuggestions(timeOfDay: string): string[] {
    const suggestions = {
      morning: ['breakfast burrito', 'coffee and pastry', 'healthy smoothie bowl', 'avocado toast', 'breakfast sandwich'],
      afternoon: ['fresh salad', 'soup and sandwich', 'poke bowl', 'grain bowl', 'light pasta'],
      evening: ['pizza', 'burger and fries', 'sushi', 'pasta dinner', 'grilled chicken'],
      night: ['late night snacks', 'dessert', 'comfort food', 'quick bites', 'delivery options']
    };

    const hour = new Date().getHours();
    let period = 'afternoon';
    
    if (hour < 11) period = 'morning';
    else if (hour < 17) period = 'afternoon';
    else if (hour < 22) period = 'evening';
    else period = 'night';

    return suggestions[period as keyof typeof suggestions] || suggestions.afternoon;
  }
}

export const openAIService = new OpenAIService();
export default openAIService;
