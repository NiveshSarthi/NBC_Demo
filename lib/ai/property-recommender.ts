export interface UserPreferences {
  budget_min?: number;
  budget_max?: number;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  area_min?: number;
  area_max?: number;
}

export interface PropertyFeatures {
  id: string;
  price: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  location: string;
  age_years: number;
  distance_to_city_center: number;
  distance_to_metro: number;
}

export class PropertyRecommender {
  constructor() {
    // Initialize without TensorFlow.js for now
  }

  private preprocessInput(userPrefs: UserPreferences, propertyFeatures: PropertyFeatures[]): number[][] {
    return propertyFeatures.map(property => [
      property.price / 10000000, // Normalize price (divide by 1 crore)
      property.bedrooms / 10, // Normalize bedrooms
      property.bathrooms / 5, // Normalize bathrooms
      property.area_sqft / 5000, // Normalize area
      property.age_years / 50, // Normalize age
      property.distance_to_city_center / 50, // Normalize distance
      property.distance_to_metro / 20 // Normalize metro distance
    ]);
  }

  private async getServerRecommendations(userPrefs: UserPreferences): Promise<PropertyFeatures[]> {
    try {
      const response = await fetch('/api/v1/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userPrefs),
      });

      if (!response.ok) {
        throw new Error('Server recommendation failed');
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Server recommendation error:', error);
      return [];
    }
  }

  async getRecommendations(
    userPrefs: UserPreferences,
    availableProperties: PropertyFeatures[]
  ): Promise<PropertyFeatures[]> {
    try {
      // First, try server-side recommendations
      const serverRecommendations = await this.getServerRecommendations(userPrefs);

      if (serverRecommendations.length > 0) {
        return serverRecommendations;
      }

      // Fallback to client-side filtering if server fails
      return this.filterPropertiesClientSide(userPrefs, availableProperties);

    } catch (error) {
      console.error('Recommendation error:', error);
      // Final fallback to basic filtering
      return this.filterPropertiesClientSide(userPrefs, availableProperties);
    }
  }

  private filterPropertiesClientSide(
    userPrefs: UserPreferences,
    properties: PropertyFeatures[]
  ): PropertyFeatures[] {
    return properties
      .filter(property => {
        // Budget filter
        if (userPrefs.budget_min && property.price < userPrefs.budget_min) return false;
        if (userPrefs.budget_max && property.price > userPrefs.budget_max) return false;

        // Property type filter
        if (userPrefs.property_type && property.property_type !== userPrefs.property_type) return false;

        // Bedrooms filter
        if (userPrefs.bedrooms && property.bedrooms < userPrefs.bedrooms) return false;

        // Bathrooms filter
        if (userPrefs.bathrooms && property.bathrooms < userPrefs.bathrooms) return false;

        // Area filter
        if (userPrefs.area_min && property.area_sqft < userPrefs.area_min) return false;
        if (userPrefs.area_max && property.area_sqft > userPrefs.area_max) return false;

        // Location filter (simple string match)
        if (userPrefs.location && !property.location.toLowerCase().includes(userPrefs.location.toLowerCase())) return false;

        return true;
      })
      .sort((a, b) => {
        // Simple scoring based on user preferences
        const scoreA = this.calculateMatchScore(a, userPrefs);
        const scoreB = this.calculateMatchScore(b, userPrefs);
        return scoreB - scoreA;
      })
      .slice(0, 10); // Return top 10
  }

  private calculateMatchScore(property: PropertyFeatures, prefs: UserPreferences): number {
    let score = 0;

    // Budget match (closer to mid-budget is better)
    if (prefs.budget_min && prefs.budget_max) {
      const midBudget = (prefs.budget_min + prefs.budget_max) / 2;
      const budgetDiff = Math.abs(property.price - midBudget);
      score += Math.max(0, 100 - (budgetDiff / midBudget) * 100);
    }

    // Property type match
    if (prefs.property_type && property.property_type === prefs.property_type) {
      score += 20;
    }

    // Bedrooms match
    if (prefs.bedrooms && property.bedrooms >= prefs.bedrooms) {
      score += 15;
    }

    // Bathrooms match
    if (prefs.bathrooms && property.bathrooms >= prefs.bathrooms) {
      score += 10;
    }

    // Area match
    if (prefs.area_min && prefs.area_max) {
      const midArea = (prefs.area_min + prefs.area_max) / 2;
      const areaDiff = Math.abs(property.area_sqft - midArea);
      score += Math.max(0, 10 - (areaDiff / midArea) * 10);
    }

    // Location match
    if (prefs.location && property.location.toLowerCase().includes(prefs.location.toLowerCase())) {
      score += 15;
    }

    // Prefer newer properties
    score += Math.max(0, 10 - property.age_years);

    // Prefer closer to city center and metro
    score += Math.max(0, 10 - property.distance_to_city_center / 5);
    score += Math.max(0, 10 - property.distance_to_metro / 2);

    return score;
  }

  // Method to score properties using simple algorithm (TensorFlow.js integration pending)
  private scoreProperties(properties: PropertyFeatures[]): number[] {
    return properties.map(property => this.calculateMatchScore(property, {}));
  }
}

// Singleton instance
export const propertyRecommender = new PropertyRecommender();