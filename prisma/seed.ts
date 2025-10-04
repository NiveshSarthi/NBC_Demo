import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';
import { getMongoDb } from '../lib/database';
import { BlogPostModel } from '../lib/models/blog-post';
import { MarketReportModel } from '../lib/models/market-report';

const prisma = new PrismaClient();

// Enhanced locations with more cities and growth metrics
const locations = [
  {
    name: 'Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    district: 'Mumbai City',
    type: 'primary' as const,
    latitude: 19.0760,
    longitude: 72.8777,
    population: 12442373,
    area_sqkm: 603.4,
    gdp_per_capita: 250000,
    growth_rate: 2.5,
    airport_distance_km: 0,
    metro_distance_km: 0,
    expressway_distance_km: 0,
    smart_city_status: true,
    tier_classification: 'tier1' as const,
    investment_potential: 9.5,
    master_plan_url: 'https://example.com/mumbai-master-plan',
    infrastructure_projects: {
      metro: ['Line 1', 'Line 2A', 'Line 2B', 'Line 3', 'Line 4', 'Line 5', 'Line 6', 'Line 7'],
      airport: ['Chhatrapati Shivaji Maharaj International Airport'],
      expressways: ['Mumbai-Pune Expressway', 'Eastern Freeway']
    }
  },
  {
    name: 'Delhi',
    city: 'Delhi',
    state: 'Delhi',
    district: 'Delhi',
    type: 'primary' as const,
    latitude: 28.7041,
    longitude: 77.1025,
    population: 30290936,
    area_sqkm: 1484,
    gdp_per_capita: 280000,
    growth_rate: 2.1,
    airport_distance_km: 0,
    metro_distance_km: 0,
    expressway_distance_km: 0,
    smart_city_status: true,
    tier_classification: 'tier1' as const,
    investment_potential: 9.8,
    master_plan_url: 'https://example.com/delhi-master-plan',
    infrastructure_projects: {
      metro: ['Red Line', 'Yellow Line', 'Blue Line', 'Green Line', 'Violet Line'],
      airport: ['Indira Gandhi International Airport'],
      expressways: ['Delhi-Gurgaon Expressway', 'Delhi-Mumbai Expressway']
    }
  },
  {
    name: 'Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    district: 'Bangalore Urban',
    type: 'primary' as const,
    latitude: 12.9716,
    longitude: 77.5946,
    population: 8443675,
    area_sqkm: 741,
    gdp_per_capita: 320000,
    growth_rate: 3.2,
    airport_distance_km: 0,
    metro_distance_km: 0,
    expressway_distance_km: 0,
    smart_city_status: true,
    tier_classification: 'tier1' as const,
    investment_potential: 9.7,
    master_plan_url: 'https://example.com/bangalore-master-plan',
    infrastructure_projects: {
      metro: ['Purple Line', 'Green Line', 'Yellow Line', 'Pink Line', 'Blue Line'],
      airport: ['Kempegowda International Airport'],
      expressways: ['Bangalore-Mysore Expressway', 'Bangalore-Chennai Expressway']
    }
  },
  {
    name: 'Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    district: 'Chennai',
    type: 'primary' as const,
    latitude: 13.0827,
    longitude: 80.2707,
    population: 10456000,
    area_sqkm: 426,
    gdp_per_capita: 220000,
    growth_rate: 2.8,
    airport_distance_km: 0,
    metro_distance_km: 0,
    expressway_distance_km: 0,
    smart_city_status: true,
    tier_classification: 'tier1' as const,
    investment_potential: 8.9,
    master_plan_url: 'https://example.com/chennai-master-plan',
    infrastructure_projects: {
      metro: ['Blue Line', 'Green Line', 'Red Line'],
      airport: ['Chennai International Airport'],
      expressways: ['Chennai-Bangalore Expressway', 'Chennai-Trichy Expressway']
    }
  },
  {
    name: 'Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    district: 'Hyderabad',
    type: 'primary' as const,
    latitude: 17.3850,
    longitude: 78.4867,
    population: 7749334,
    area_sqkm: 650,
    gdp_per_capita: 180000,
    growth_rate: 3.5,
    airport_distance_km: 0,
    metro_distance_km: 0,
    expressway_distance_km: 0,
    smart_city_status: true,
    tier_classification: 'tier1' as const,
    investment_potential: 9.2,
    master_plan_url: 'https://example.com/hyderabad-master-plan',
    infrastructure_projects: {
      metro: ['Red Line', 'Blue Line', 'Green Line', 'Orange Line'],
      airport: ['Rajiv Gandhi International Airport'],
      expressways: ['Hyderabad-Bangalore Expressway', 'Hyderabad-Vijayawada Expressway']
    }
  },
  {
    name: 'Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    district: 'Kolkata',
    type: 'primary' as const,
    latitude: 22.5726,
    longitude: 88.3639,
    population: 4486679,
    area_sqkm: 205,
    gdp_per_capita: 160000,
    growth_rate: 2.0,
    airport_distance_km: 0,
    metro_distance_km: 0,
    expressway_distance_km: 0,
    smart_city_status: true,
    tier_classification: 'tier1' as const,
    investment_potential: 8.7,
    master_plan_url: 'https://example.com/kolkata-master-plan',
    infrastructure_projects: {
      metro: ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5', 'Line 6'],
      airport: ['Netaji Subhas Chandra Bose International Airport'],
      expressways: ['Kolkata-Durgapur Expressway', 'Kolkata-Siliguri Expressway']
    }
  },
  {
    name: 'Goa',
    city: 'Panaji',
    state: 'Goa',
    district: 'North Goa',
    type: 'secondary' as const,
    latitude: 15.4909,
    longitude: 73.8278,
    population: 40017,
    area_sqkm: 114,
    gdp_per_capita: 250000,
    growth_rate: 4.2,
    airport_distance_km: 0,
    metro_distance_km: null,
    expressway_distance_km: null,
    smart_city_status: false,
    tier_classification: 'tier2' as const,
    investment_potential: 8.5,
    master_plan_url: 'https://example.com/goa-master-plan',
    infrastructure_projects: {
      airport: ['Goa International Airport'],
      expressways: ['NH-66 (Panvel-Kochi Highway)']
    },
    religious_sites: {
      churches: ['Basilica of Bom Jesus', 'Se Cathedral'],
      temples: ['Mangueshi Temple', 'Sula Vineyards']
    }
  },
  {
    name: 'Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    district: 'Ahmedabad',
    type: 'primary' as const,
    latitude: 23.0225,
    longitude: 72.5714,
    population: 5570585,
    area_sqkm: 464,
    gdp_per_capita: 150000,
    growth_rate: 3.8,
    airport_distance_km: 0,
    metro_distance_km: 0,
    expressway_distance_km: 0,
    smart_city_status: true,
    tier_classification: 'tier1' as const,
    investment_potential: 8.8,
    master_plan_url: 'https://example.com/ahmedabad-master-plan',
    infrastructure_projects: {
      metro: ['East-West Corridor', 'North-South Corridor'],
      airport: ['Sardar Vallabhbhai Patel International Airport'],
      expressways: ['Ahmedabad-Vadodara Expressway', 'Delhi-Mumbai Expressway']
    }
  }
];

// Sample users
const users = [
  {
    email: 'admin@nextboomcity.com',
    password: 'AdminPass123!',
    first_name: 'System',
    last_name: 'Administrator',
    phone: '+91-9999999999',
    role: 'admin' as const,
    email_verified: true,
    phone_verified: true,
    investment_budget: 50000000,
    preferred_locations: ['Mumbai', 'Delhi', 'Bangalore']
  },
  {
    email: 'agent1@nextboomcity.com',
    password: 'AgentPass123!',
    first_name: 'Rajesh',
    last_name: 'Kumar',
    phone: '+91-9876543210',
    role: 'agent' as const,
    email_verified: true,
    phone_verified: true,
    investment_budget: 10000000,
    preferred_locations: ['Mumbai', 'Pune', 'Ahmedabad']
  },
  {
    email: 'user1@nextboomcity.com',
    password: 'UserPass123!',
    first_name: 'Amit',
    last_name: 'Singh',
    phone: '+91-9876543212',
    role: 'user' as const,
    email_verified: true,
    phone_verified: true,
    investment_budget: 5000000,
    preferred_locations: ['Bangalore', 'Hyderabad', 'Chennai']
  }
];

// Sample properties with realistic Indian real estate data
const properties = [
  // Mumbai Properties
  {
    title: 'Luxury 3BHK Apartment in South Mumbai',
    description: 'Premium residential apartment with sea-facing views, modern amenities, and world-class facilities.',
    property_type: 'residential' as const,
    sub_type: 'Apartment',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Marine Drive, Churchgate, Mumbai',
    pincode: '400020',
    latitude: 18.9256,
    longitude: 72.8242,
    price: 25000000,
    price_unit: 'INR' as const,
    area: 1800,
    area_unit: 'sqft' as const,
    bedrooms: 3,
    bathrooms: 3,
    parking_spaces: 2,
    floor_number: 15,
    total_floors: 30,
    year_built: 2020,
    furnishing: 'fully_furnished' as const,
    amenities: ['Swimming Pool', 'Gym', 'Security', 'Power Backup', 'Intercom', 'Lift', 'Parking'],
    features: ['Sea Facing', 'Corner Unit', 'Modular Kitchen', 'Air Conditioning'],
    rera_registered: true,
    rera_number: 'MH/12345/2020',
    ownership_type: 'freehold' as const,
    possession_status: 'ready_to_move' as const,
    developer_name: 'DLF Limited',
    project_name: 'Marine Heights',
    ai_score: 9.2,
    ai_prediction: {
      predicted_price_appreciation: 8.5,
      investment_score: 9.0,
      rental_yield: 3.2
    },
    featured: true,
    premium_listing: true,
    views_count: 245,
    inquiries_count: 12
  },
  {
    title: 'Commercial Office Space in Bandra Kurla Complex',
    description: 'Prime commercial office space in the heart of Mumbai\'s business district with excellent connectivity.',
    property_type: 'commercial' as const,
    sub_type: 'Office Space',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Bandra Kurla Complex, Bandra East, Mumbai',
    pincode: '400051',
    latitude: 19.0696,
    longitude: 72.8679,
    price: 45000000,
    price_unit: 'INR' as const,
    area: 3200,
    area_unit: 'sqft' as const,
    floor_number: 8,
    total_floors: 20,
    year_built: 2018,
    furnishing: 'semi_furnished' as const,
    amenities: ['High-speed Internet', 'Conference Room', 'Reception', 'Security', 'Power Backup', 'Lift', 'Parking'],
    features: ['Corner Office', 'Panoramic Views', 'Central AC', 'False Ceiling'],
    rera_registered: true,
    rera_number: 'MH/23456/2018',
    ownership_type: 'leasehold' as const,
    possession_status: 'ready_to_move' as const,
    developer_name: 'Raheja Developers',
    project_name: 'BKC Tower',
    ai_score: 8.8,
    ai_prediction: {
      predicted_price_appreciation: 7.2,
      investment_score: 8.5,
      rental_yield: 4.1
    },
    featured: true,
    premium_listing: false,
    views_count: 189,
    inquiries_count: 8
  },
  // Delhi Properties
  {
    title: 'Spacious 4BHK Villa in Gurgaon',
    description: 'Independent villa with private garden, modern architecture, and premium location in DLF Phase 1.',
    property_type: 'residential' as const,
    sub_type: 'Villa',
    city: 'Delhi',
    state: 'Delhi',
    address: 'DLF Phase 1, Gurgaon',
    pincode: '122002',
    latitude: 28.4727,
    longitude: 77.1036,
    price: 85000000,
    price_unit: 'INR' as const,
    area: 4500,
    area_unit: 'sqft' as const,
    bedrooms: 4,
    bathrooms: 5,
    parking_spaces: 4,
    floor_number: null,
    total_floors: null,
    year_built: 2019,
    furnishing: 'semi_furnished' as const,
    amenities: ['Swimming Pool', 'Garden', 'Gym', 'Security', 'Power Backup', 'Servant Quarter'],
    features: ['Private Garden', 'Modular Kitchen', 'Home Theater', 'Solar Panels'],
    rera_registered: true,
    rera_number: 'HR/34567/2019',
    ownership_type: 'freehold' as const,
    possession_status: 'ready_to_move' as const,
    developer_name: 'DLF Limited',
    project_name: 'DLF Villas',
    ai_score: 9.5,
    ai_prediction: {
      predicted_price_appreciation: 9.1,
      investment_score: 9.3,
      rental_yield: 2.8
    },
    featured: true,
    premium_listing: true,
    views_count: 312,
    inquiries_count: 18
  },
  // Bangalore Properties
  {
    title: 'Modern 2BHK Apartment in Whitefield',
    description: 'Contemporary apartment in IT hub with proximity to major tech parks and excellent connectivity.',
    property_type: 'residential' as const,
    sub_type: 'Apartment',
    city: 'Bangalore',
    state: 'Karnataka',
    address: 'Whitefield, Bangalore',
    pincode: '560066',
    latitude: 12.9698,
    longitude: 77.7500,
    price: 12000000,
    price_unit: 'INR' as const,
    area: 1200,
    area_unit: 'sqft' as const,
    bedrooms: 2,
    bathrooms: 2,
    parking_spaces: 1,
    floor_number: 5,
    total_floors: 15,
    year_built: 2021,
    furnishing: 'fully_furnished' as const,
    amenities: ['Gym', 'Swimming Pool', 'Children\'s Play Area', 'Security', 'Power Backup', 'Lift'],
    features: ['Vastu Compliant', 'Modular Kitchen', 'Air Conditioning', 'Internet Ready'],
    rera_registered: true,
    rera_number: 'KA/45678/2021',
    ownership_type: 'freehold' as const,
    possession_status: 'ready_to_move' as const,
    developer_name: 'Prestige Group',
    project_name: 'Prestige White Meadows',
    ai_score: 8.9,
    ai_prediction: {
      predicted_price_appreciation: 8.8,
      investment_score: 8.7,
      rental_yield: 3.5
    },
    featured: false,
    premium_listing: true,
    views_count: 156,
    inquiries_count: 6
  },
  // Chennai Properties
  {
    title: 'Beachfront 3BHK Apartment in ECR',
    description: 'Luxury beachfront property with stunning ocean views and world-class amenities.',
    property_type: 'residential' as const,
    sub_type: 'Apartment',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'East Coast Road, Chennai',
    pincode: '600041',
    latitude: 12.9442,
    longitude: 80.2503,
    price: 18000000,
    price_unit: 'INR' as const,
    area: 1600,
    area_unit: 'sqft' as const,
    bedrooms: 3,
    bathrooms: 3,
    parking_spaces: 2,
    floor_number: 10,
    total_floors: 20,
    year_built: 2019,
    furnishing: 'semi_furnished' as const,
    amenities: ['Beach Access', 'Swimming Pool', 'Gym', 'Tennis Court', 'Security', 'Power Backup'],
    features: ['Sea Facing', 'Infinity Pool View', 'Smart Home Features', 'Private Terrace'],
    rera_registered: true,
    rera_number: 'TN/56789/2019',
    ownership_type: 'freehold' as const,
    possession_status: 'ready_to_move' as const,
    developer_name: 'Casagrand',
    project_name: 'Casagrand ECR',
    ai_score: 9.1,
    ai_prediction: {
      predicted_price_appreciation: 7.8,
      investment_score: 8.9,
      rental_yield: 3.0
    },
    featured: true,
    premium_listing: false,
    views_count: 278,
    inquiries_count: 14
  },
  // Goa Properties (Rental)
  {
    title: 'Luxury Beach Villa for Rent in Calangute',
    description: 'Stunning beachfront villa available for monthly rental with modern amenities and panoramic ocean views.',
    property_type: 'residential' as const,
    listing_type: 'rent' as const,
    sub_type: 'Villa',
    city: 'Panaji',
    state: 'Goa',
    address: 'Calangute Beach, North Goa',
    pincode: '403516',
    latitude: 15.5405,
    longitude: 73.7551,
    price: null,
    rent_amount: 85000,
    rent_period: 'monthly' as const,
    price_unit: 'INR' as const,
    area: 2500,
    area_unit: 'sqft' as const,
    bedrooms: 4,
    bathrooms: 4,
    parking_spaces: 2,
    floor_number: null,
    total_floors: null,
    year_built: 2018,
    furnishing: 'fully_furnished' as const,
    amenities: ['Private Beach Access', 'Swimming Pool', 'Garden', 'Gym', 'Security', 'Power Backup', 'Housekeeping'],
    features: ['Ocean View', 'Private Terrace', 'Modular Kitchen', 'Air Conditioning', 'WiFi'],
    rera_registered: true,
    rera_number: 'GA/67890/2018',
    ownership_type: 'freehold' as const,
    possession_status: 'ready_to_move' as const,
    developer_name: 'Goa Villas',
    project_name: 'Calangute Paradise',
    ai_score: 8.7,
    ai_prediction: {
      predicted_price_appreciation: 6.5,
      investment_score: 8.2,
      rental_yield: 4.5
    },
    featured: false,
    premium_listing: true,
    views_count: 145,
    inquiries_count: 9
  }
];

// Sample blog posts for MongoDB
const blogPosts = [
  {
    title: 'Real Estate Market Trends in India 2024',
    slug: 'real-estate-market-trends-india-2024',
    content: `
      <h2>Introduction</h2>
      <p>The Indian real estate market continues to evolve with significant changes in 2024. With rapid urbanization and changing demographics, the sector presents both challenges and opportunities for investors.</p>

      <h2>Key Market Trends</h2>
      <ul>
        <li><strong>Tier 2 and Tier 3 Cities:</strong> Increased focus on secondary cities due to infrastructure development</li>
        <li><strong>Affordable Housing:</strong> Government initiatives driving demand for budget-friendly properties</li>
        <li><strong>Smart Cities:</strong> Integration of technology in urban planning and property development</li>
        <li><strong>Sustainable Development:</strong> Growing emphasis on green building practices</li>
      </ul>

      <h2>Investment Opportunities</h2>
      <p>Investors should focus on emerging markets with high growth potential and infrastructure development.</p>
    `,
    excerpt: 'An in-depth analysis of the current real estate market trends and future predictions for Indian property market.',
    authorId: 2,
    categories: ['market-analysis', 'investment'],
    tags: ['real-estate', 'india', '2024', 'trends', 'investment'],
    status: 'published' as const,
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    seo: {
      title: 'Real Estate Market Trends India 2024 - NextBoomCity',
      description: 'Comprehensive analysis of Indian real estate market trends, investment opportunities, and future predictions for 2024.',
      keywords: ['real estate trends', 'India property market', 'investment opportunities', '2024 forecast']
    }
  },
  {
    title: 'Top 10 Investment Destinations in India',
    slug: 'top-10-investment-destinations-india',
    content: `
      <h2>Investment Landscape in India</h2>
      <p>India offers diverse investment opportunities across different cities and property types. Understanding the growth potential of each location is crucial for successful real estate investments.</p>

      <h2>Top Cities for Real Estate Investment</h2>
      <ol>
        <li><strong>Mumbai:</strong> Commercial hub with high rental yields</li>
        <li><strong>Delhi-NCR:</strong> Rapid infrastructure development</li>
        <li><strong>Bangalore:</strong> IT sector growth driving demand</li>
        <li><strong>Chennai:</strong> Industrial and residential growth</li>
        <li><strong>Hyderabad:</strong> Emerging IT and pharma hub</li>
        <li><strong>Pune:</strong> Educational and manufacturing center</li>
        <li><strong>Ahmedabad:</strong> Smart city initiatives</li>
        <li><strong>Jaipur:</strong> Tourism and heritage value</li>
        <li><strong>Surat:</strong> Textile industry growth</li>
        <li><strong>Lucknow:</strong> Government investments</li>
      </ol>
    `,
    excerpt: 'Discover the top 10 cities in India for real estate investment with detailed analysis of growth potential and market trends.',
    authorId: 2,
    categories: ['investment-guide', 'locations'],
    tags: ['investment', 'cities', 'growth', 'real-estate', 'india'],
    status: 'published' as const,
    publishedAt: new Date('2024-02-01T10:00:00Z'),
    seo: {
      title: 'Top 10 Investment Destinations India 2024',
      description: 'Comprehensive guide to the best cities for real estate investment in India with market analysis and growth forecasts.',
      keywords: ['real estate investment', 'top cities India', 'property investment', 'growth cities']
    }
  }
];

// Sample market reports for MongoDB
const marketReports = [
  {
    title: 'Q4 2024 Mumbai Real Estate Market Report',
    slug: 'q4-2024-mumbai-real-estate-market-report',
    description: 'Comprehensive analysis of Mumbai real estate market performance in Q4 2024, including price trends, new launches, and investment opportunities.',
    type: 'quarterly' as const,
    format: 'pdf' as const,
    fileUrl: 'https://example.com/reports/mumbai-q4-2024.pdf',
    fileSize: 2500000,
    thumbnailUrl: 'https://example.com/thumbnails/mumbai-report.jpg',
    categories: ['mumbai', 'residential', '2024'],
    tags: ['mumbai', 'market-report', 'q4-2024', 'residential', 'commercial'],
    authorId: 1,
    status: 'published' as const,
    publishedAt: new Date('2024-01-01T10:00:00Z'),
    seo: {
      title: 'Mumbai Real Estate Market Report Q4 2024',
      description: 'Latest Mumbai property market analysis with price trends, inventory status, and investment insights.',
      keywords: ['Mumbai real estate', 'market report', 'property prices', 'investment analysis']
    }
  },
  {
    title: 'Delhi-NCR Residential Price Trends 2024',
    slug: 'delhi-ncr-residential-price-trends-2024',
    description: 'Detailed price trend analysis for residential properties across Delhi-NCR region with forecasts for 2024-2025.',
    type: 'monthly' as const,
    format: 'excel' as const,
    fileUrl: 'https://example.com/reports/delhi-price-trends-2024.xlsx',
    fileSize: 1800000,
    thumbnailUrl: 'https://example.com/thumbnails/delhi-trends.jpg',
    categories: ['delhi', 'residential', 'price-trends'],
    tags: ['delhi', 'price-trends', 'residential', 'forecast', '2024'],
    authorId: 1,
    status: 'published' as const,
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    seo: {
      title: 'Delhi NCR Property Price Trends 2024',
      description: 'Monthly analysis of residential property prices in Delhi-NCR with growth projections.',
      keywords: ['Delhi property prices', 'NCR real estate', 'price trends', 'market analysis']
    }
  }
];

async function seedLocations() {
  console.log('Seeding locations...');
  for (const location of locations) {
    try {
      await prisma.location.create({ data: location });
      console.log(`✓ Created location: ${location.name}`);
    } catch (error) {
      console.log(`- Location ${location.name} already exists, skipping...`);
    }
  }
}

async function seedUsers() {
  console.log('Seeding users...');
  for (const user of users) {
    try {
      const hashedPassword = await hashPassword(user.password);
      await prisma.user.create({
        data: {
          ...user,
          password_hash: hashedPassword
        }
      });
      console.log(`✓ Created user: ${user.email}`);
    } catch (error) {
      console.log(`- User ${user.email} already exists, skipping...`);
    }
  }
}

async function seedProperties() {
  console.log('Seeding properties...');

  // Get location IDs
  const mumbai = await prisma.location.findFirst({ where: { city: 'Mumbai' } });
  const delhi = await prisma.location.findFirst({ where: { city: 'Delhi' } });
  const bangalore = await prisma.location.findFirst({ where: { city: 'Bangalore' } });
  const chennai = await prisma.location.findFirst({ where: { city: 'Chennai' } });
  const goa = await prisma.location.findFirst({ where: { city: 'Panaji' } });
  const ahmedabad = await prisma.location.findFirst({ where: { city: 'Ahmedabad' } });

  // Get user IDs
  const agent1 = await prisma.user.findFirst({ where: { email: 'agent1@nextboomcity.com' } });

  if (!mumbai || !delhi || !bangalore || !chennai || !goa || !ahmedabad || !agent1) {
    console.log('Required locations or users not found, skipping property seeding');
    return;
  }

  const propertiesWithIds = properties.map((prop, index) => ({
    ...prop,
    location_id: prop.city === 'Mumbai' ? mumbai.id :
                 prop.city === 'Delhi' ? delhi.id :
                 prop.city === 'Bangalore' ? bangalore.id :
                 prop.city === 'Chennai' ? chennai.id :
                 prop.city === 'Panaji' ? goa.id : null,
    created_by: agent1.id
  }));

  for (const property of propertiesWithIds) {
    try {
      const created = await prisma.property.create({ data: property });
      console.log(`✓ Created property: ${property.title}`);

      // Add sample images for each property
      const images = [
        {
          property_id: created.id,
          image_url: `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=${created.id}`,
          alt_text: 'Property interior',
          is_primary: true,
          sort_order: 0,
          image_type: 'interior' as const
        },
        {
          property_id: created.id,
          image_url: `https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=${created.id}`,
          alt_text: 'Property exterior',
          is_primary: false,
          sort_order: 1,
          image_type: 'exterior' as const
        }
      ];

      for (const image of images) {
        await prisma.propertyImage.create({ data: image });
      }

      // Add analytics data
      for (let i = 0; i < 10; i++) {
        await prisma.analytic.create({
          data: {
            property_id: created.id,
            event_type: ['view', 'view', 'view', 'inquiry', 'save'][Math.floor(Math.random() * 5)] as any,
            session_id: `session_${created.id}_${i}`,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        });
      }

      // Add AI predictions
      const baseValue = property.listing_type === 'rent' ? property.rent_amount : property.price;
      const predictions = [
        {
          property_id: created.id,
          prediction_type: 'price_forecast' as const,
          predicted_value: baseValue * (1 + Math.random() * 0.2),
          confidence_score: 80 + Math.random() * 15,
          valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          factors: {
            location_growth: Math.random() * 20,
            market_demand: Math.random() * 25,
            infrastructure: Math.random() * 30
          }
        },
        {
          property_id: created.id,
          prediction_type: 'investment_score' as const,
          predicted_value: 7 + Math.random() * 3,
          confidence_score: 85 + Math.random() * 10,
          valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          factors: {
            roi_potential: Math.random() * 40,
            risk_level: Math.random() * 30,
            liquidity: Math.random() * 30
          }
        }
      ];

      for (const prediction of predictions) {
        await prisma.aiPrediction.create({ data: prediction });
      }

    } catch (error) {
      console.log(`- Property ${property.title} already exists, skipping...`);
    }
  }
}

async function seedMongoDBContent() {
  console.log('Seeding MongoDB content...');

  const db = await getMongoDb();

  // Seed blog posts
  console.log('Seeding blog posts...');
  for (const post of blogPosts) {
    try {
      await BlogPostModel.create(post);
      console.log(`✓ Created blog post: ${post.title}`);
    } catch (error) {
      console.log(`- Blog post ${post.title} already exists, skipping...`);
    }
  }

  // Seed market reports
  console.log('Seeding market reports...');
  for (const report of marketReports) {
    try {
      await MarketReportModel.create(report);
      console.log(`✓ Created market report: ${report.title}`);
    } catch (error) {
      console.log(`- Market report ${report.title} already exists, skipping...`);
    }
  }
}

async function main() {
  console.log('🚀 Starting comprehensive database seeding...\n');

  try {
    await seedLocations();
    console.log('');

    await seedUsers();
    console.log('');

    await seedProperties();
    console.log('');

    await seedMongoDBContent();
    console.log('');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.');
  });