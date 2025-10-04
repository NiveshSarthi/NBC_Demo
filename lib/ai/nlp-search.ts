import nlp from 'compromise';

export interface ParsedQuery {
  property_type?: string;
  location?: string;
  budget_min?: number;
  budget_max?: number;
  bedrooms?: number;
  bathrooms?: number;
  area_min?: number;
  area_max?: number;
  amenities?: string[];
  raw_query: string;
}

export class NLPSearchProcessor {
  parseQuery(query: string): ParsedQuery {
    const doc = nlp(query.toLowerCase());

    return {
      property_type: this.extractPropertyType(doc),
      location: this.extractLocation(doc),
      budget_min: this.extractBudgetMin(doc),
      budget_max: this.extractBudgetMax(doc),
      bedrooms: this.extractBedrooms(doc),
      bathrooms: this.extractBathrooms(doc),
      area_min: this.extractAreaMin(doc),
      area_max: this.extractAreaMax(doc),
      amenities: this.extractAmenities(doc),
      raw_query: query
    };
  }

  private extractPropertyType(doc: any): string | undefined {
    const types = ['apartment', 'flat', 'villa', 'house', 'office', 'shop', 'warehouse', 'plot', 'land'];
    const typeAliases = {
      'flat': 'apartment',
      'house': 'villa',
      'shop': 'office'
    };

    for (const type of types) {
      if (doc.has(type)) {
        return typeAliases[type as keyof typeof typeAliases] || type;
      }
    }
    return undefined;
  }

  private extractLocation(doc: any): string | undefined {
    // Common Indian cities and locations
    const locations = [
      'delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'pune', 'hyderabad', 'ahmedabad',
      'noida', 'gurgaon', 'faridabad', 'ghaziabad', 'greater noida', 'yamunanagar',
      'panipat', 'karnal', 'hisar', 'ambala', 'patiala', 'jalandhar', 'ludhiana'
    ];

    for (const location of locations) {
      if (doc.has(location)) {
        return location;
      }
    }

    // Try to extract any place name
    const places = doc.places().out('array');
    if (places.length > 0) {
      return places[0];
    }

    return undefined;
  }

  private extractBudgetMin(doc: any): number | undefined {
    const moneyTerms = doc.money().json();
    if (moneyTerms.length > 0) {
      const amount = moneyTerms[0].number;
      const unit = moneyTerms[0].currency || 'INR';

      // Convert to rupees if needed
      if (unit === 'USD' || unit === '$') {
        return amount * 83; // Approximate USD to INR conversion
      }
      return amount;
    }
    return undefined;
  }

  private extractBudgetMax(doc: any): number | undefined {
    const moneyTerms = doc.money().json();
    if (moneyTerms.length > 1) {
      const amount = moneyTerms[1].number;
      const unit = moneyTerms[1].currency || 'INR';

      if (unit === 'USD' || unit === '$') {
        return amount * 83;
      }
      return amount;
    }
    return undefined;
  }

  private extractBedrooms(doc: any): number | undefined {
    const bedroomTerms = ['bhk', 'bedroom', 'bed'];
    const numbers = doc.numbers().json();

    for (const num of numbers) {
      // Check if this number is associated with bedrooms
      const wordIndex = doc.text.indexOf(num.text);
      const context = doc.text.substring(Math.max(0, wordIndex - 20), wordIndex + 20);

      if (bedroomTerms.some(term => context.includes(term))) {
        return parseInt(num.number);
      }
    }

    // Direct BHK mentions
    if (doc.has('bhk')) {
      const bhkMatch = doc.match('#Number bhk').numbers().json();
      if (bhkMatch.length > 0) {
        return parseInt(bhkMatch[0].number);
      }
    }

    return undefined;
  }

  private extractBathrooms(doc: any): number | undefined {
    const bathroomTerms = ['bathroom', 'bath'];
    const numbers = doc.numbers().json();

    for (const num of numbers) {
      const wordIndex = doc.text.indexOf(num.text);
      const context = doc.text.substring(Math.max(0, wordIndex - 20), wordIndex + 20);

      if (bathroomTerms.some(term => context.includes(term))) {
        return parseInt(num.number);
      }
    }
    return undefined;
  }

  private extractAreaMin(doc: any): number | undefined {
    return this.extractArea(doc, 'min');
  }

  private extractAreaMax(doc: any): number | undefined {
    return this.extractArea(doc, 'max');
  }

  private extractArea(doc: any, type: 'min' | 'max'): number | undefined {
    const areaTerms = ['sqft', 'square feet', 'sq ft', 'sq.m', 'sq meter'];
    const numbers = doc.numbers().json();

    for (const num of numbers) {
      const wordIndex = doc.text.indexOf(num.text);
      const context = doc.text.substring(Math.max(0, wordIndex - 30), wordIndex + 30);

      if (areaTerms.some(term => context.includes(term))) {
        if (type === 'min' && context.includes('above') || context.includes('more than') || context.includes('minimum')) {
          return parseInt(num.number);
        }
        if (type === 'max' && context.includes('below') || context.includes('less than') || context.includes('maximum') || context.includes('up to')) {
          return parseInt(num.number);
        }
        if (type === 'min') {
          return parseInt(num.number);
        }
      }
    }
    return undefined;
  }

  private extractAmenities(doc: any): string[] {
    const amenities = [
      'parking', 'garden', 'swimming pool', 'gym', 'security', 'lift', 'elevator',
      'power backup', 'water supply', 'maintenance', 'club house', 'playground'
    ];

    return amenities.filter(amenity => doc.has(amenity));
  }
}

// Singleton instance
export const nlpSearchProcessor = new NLPSearchProcessor();