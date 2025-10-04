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
    slug: 'demo-sale-1',
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
    slug: 'demo-sale-2',
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
    slug: 'demo-sale-3',
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
    slug: 'demo-sale-4',
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
    slug: 'demo-rent-1',
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

// Sample Builders data
const builders = [
  {
    name: 'DLF Limited',
    history: 'Founded in 1946, DLF is one of India\'s largest real estate developers with over 60 years of experience. Started as a trading company and transitioned to real estate in the 1970s.',
    past_projects: [
      { name: 'DLF Cyber City', completion_date: '2005-01-01', location: 'Gurgaon' },
      { name: 'DLF Mall of India', completion_date: '2016-03-15', location: 'Noida' },
      { name: 'DLF Emporio', completion_date: '2018-09-20', location: 'Mumbai' },
      { name: 'DLF The Crest', completion_date: '2020-06-10', location: 'Delhi' }
    ],
    delivery_track_record: {
      completed_projects_count: 285,
      on_time_delivery_rate: 94.5,
      customer_satisfaction_rating: 4.2
    },
    ratings: 4.3,
    financial_stability: {
      revenue: 4500000000,
      profit_margin: 18.5,
      debt_ratio: 0.45
    },
    awards: ['CREDAI Award 2023', 'Best Developer Award 2022', 'Green Building Excellence Award'],
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    name: 'Prestige Group',
    history: 'Established in 1986, Prestige Group is a Bengaluru-based conglomerate with interests in real estate, infrastructure, and hospitality.',
    past_projects: [
      { name: 'Prestige Falcon City', completion_date: '2012-07-15', location: 'Bangalore' },
      { name: 'Prestige Shantiniketan', completion_date: '2018-11-30', location: 'Bangalore' },
      { name: 'Prestige City', completion_date: '2021-04-22', location: 'Hyderabad' },
      { name: 'Prestige Lakeside Habitat', completion_date: '2019-12-15', location: 'Chennai' }
    ],
    delivery_track_record: {
      completed_projects_count: 198,
      on_time_delivery_rate: 92.8,
      customer_satisfaction_rating: 4.1
    },
    ratings: 4.4,
    financial_stability: {
      revenue: 3200000000,
      profit_margin: 22.3,
      debt_ratio: 0.38
    },
    awards: ['ET Now Real Estate Award 2023', 'CNBC Awaaz Real Estate Award 2022', 'IGBC Green Building Award'],
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    name: 'Godrej Properties',
    history: 'Part of the Godrej Group founded in 1897, Godrej Properties entered real estate development in 1990 and has become a major player in the residential sector.',
    past_projects: [
      { name: 'Godrej Platinum', completion_date: '2014-08-20', location: 'Mumbai' },
      { name: 'Godrej Woods', completion_date: '2017-03-10', location: 'Bangalore' },
      { name: 'Godrej One', completion_date: '2020-01-15', location: 'Mumbai' },
      { name: 'Godrej City', completion_date: '2022-11-25', location: 'Ahmedabad' }
    ],
    delivery_track_record: {
      completed_projects_count: 156,
      on_time_delivery_rate: 96.2,
      customer_satisfaction_rating: 4.3
    },
    ratings: 4.5,
    financial_stability: {
      revenue: 2800000000,
      profit_margin: 25.1,
      debt_ratio: 0.32
    },
    awards: ['Best Residential Developer 2023', 'Green Rating for Integrated Habitat Assessment', 'CREDAI Excellence Award'],
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    name: 'Lodha Group',
    history: 'Founded in 1980 by Mangal Prabhat Lodha, the group has developed over 45 million sq ft of real estate across India.',
    past_projects: [
      { name: 'Lodha Fiorenza', completion_date: '2016-12-05', location: 'Mumbai' },
      { name: 'Lodha Park', completion_date: '2019-07-30', location: 'Mumbai' },
      { name: 'Lodha Bellagio', completion_date: '2021-09-18', location: 'Mumbai' },
      { name: 'Lodha Evoq', completion_date: '2023-02-14', location: 'Mumbai' }
    ],
    delivery_track_record: {
      completed_projects_count: 234,
      on_time_delivery_rate: 91.7,
      customer_satisfaction_rating: 4.0
    },
    ratings: 4.2,
    financial_stability: {
      revenue: 3800000000,
      profit_margin: 19.8,
      debt_ratio: 0.42
    },
    awards: ['MCHI Excellence Award 2022', 'IGBC Platinum Rating', 'CNBC Awaaz Real Estate Award'],
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    name: 'Casagrand',
    history: 'Established in 2000, Casagrand has grown to become one of South India\'s leading real estate developers with a focus on affordable and mid-segment housing.',
    past_projects: [
      { name: 'Casagrand ECR', completion_date: '2019-06-25', location: 'Chennai' },
      { name: 'Casagrand Zenith', completion_date: '2021-11-10', location: 'Bangalore' },
      { name: 'Casagrand Palm Springs', completion_date: '2020-08-30', location: 'Chennai' },
      { name: 'Casagrand Valencia', completion_date: '2022-04-18', location: 'Coimbatore' }
    ],
    delivery_track_record: {
      completed_projects_count: 89,
      on_time_delivery_rate: 95.3,
      customer_satisfaction_rating: 4.4
    },
    ratings: 4.6,
    financial_stability: {
      revenue: 1500000000,
      profit_margin: 28.7,
      debt_ratio: 0.25
    },
    awards: ['Best Affordable Housing Developer 2023', 'Green Building Excellence', 'Customer Choice Award'],
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    name: 'Raheja Developers',
    history: 'Part of the K Raheja Corp, Raheja Developers has been in the real estate business since 1956 and is known for commercial and residential projects.',
    past_projects: [
      { name: 'Raheja Revanta', completion_date: '2018-10-12', location: 'Mumbai' },
      { name: 'Raheja Imperia', completion_date: '2020-05-08', location: 'Gurgaon' },
      { name: 'Raheja Atlantis', completion_date: '2017-03-22', location: 'Mumbai' },
      { name: 'Raheja Exotica', completion_date: '2022-08-15', location: 'Mumbai' }
    ],
    delivery_track_record: {
      completed_projects_count: 145,
      on_time_delivery_rate: 93.1,
      customer_satisfaction_rating: 4.1
    },
    ratings: 4.3,
    financial_stability: {
      revenue: 2200000000,
      profit_margin: 21.4,
      debt_ratio: 0.41
    },
    awards: ['CREDAI Award for Excellence', 'Best Commercial Developer 2022', 'Sustainability Award'],
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  }
];

// Sample Offers data
const offers = [
  {
    title: 'Diwali Festive Offer',
    description: 'Special Diwali discount of up to 10% on select residential properties. Limited time offer valid till Diwali.',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80',
    link_url: '/offers/diwali-festive',
    type: 'festival' as const,
    is_active: true,
    start_date: new Date('2024-10-25T00:00:00Z'),
    end_date: new Date('2024-11-15T23:59:59Z'),
    priority: 10,
    created_at: new Date('2024-10-20T00:00:00Z'),
    updated_at: new Date('2024-10-20T00:00:00Z')
  },
  {
    title: 'Demo Banner - Special Launch Offer',
    description: 'Exclusive launch offer for demo properties. Get amazing deals on premium locations with developer discounts.',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
    link_url: '/properties?featured=true',
    type: 'seasonal' as const,
    is_active: true,
    start_date: new Date('2024-01-01T00:00:00Z'),
    end_date: new Date('2024-12-31T23:59:59Z'),
    priority: 9,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    title: 'Early Bird Discount',
    description: 'Book your dream home early and get up to 5% discount on new launches. Valid for first 50 bookings.',
    image_url: 'https://example.com/offers/early-bird.jpg',
    link_url: '/offers/early-bird',
    type: 'limited_time' as const,
    is_active: true,
    start_date: new Date('2024-01-01T00:00:00Z'),
    end_date: new Date('2024-12-31T23:59:59Z'),
    priority: 8,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    title: 'First-Time Homebuyer Special',
    description: 'Special assistance for first-time buyers including stamp duty exemption and subsidized interest rates.',
    image_url: 'https://example.com/offers/first-time-buyer.jpg',
    link_url: '/offers/first-time-buyer',
    type: 'seasonal' as const,
    is_active: true,
    start_date: new Date('2024-04-01T00:00:00Z'),
    end_date: new Date('2024-09-30T23:59:59Z'),
    priority: 9,
    created_at: new Date('2024-04-01T00:00:00Z'),
    updated_at: new Date('2024-04-01T00:00:00Z')
  },
  {
    title: 'DLF Builder Offer',
    description: 'Exclusive offer from DLF - Free modular kitchen worth ₹5 lakhs on select apartments in Phase 1.',
    image_url: 'https://example.com/offers/dlf-builder-offer.jpg',
    link_url: '/offers/dlf-builder-offer',
    type: 'builder' as const,
    is_active: true,
    start_date: new Date('2024-06-01T00:00:00Z'),
    end_date: new Date('2024-12-31T23:59:59Z'),
    priority: 7,
    created_at: new Date('2024-06-01T00:00:00Z'),
    updated_at: new Date('2024-06-01T00:00:00Z')
  },
  {
    title: 'Monsoon Maintenance Package',
    description: 'Get a comprehensive home maintenance package worth ₹50,000 absolutely free with any property booking.',
    image_url: 'https://example.com/offers/monsoon-maintenance.jpg',
    link_url: '/offers/monsoon-maintenance',
    type: 'seasonal' as const,
    is_active: true,
    start_date: new Date('2024-06-15T00:00:00Z'),
    end_date: new Date('2024-09-15T23:59:59Z'),
    priority: 6,
    created_at: new Date('2024-06-15T00:00:00Z'),
    updated_at: new Date('2024-06-15T00:00:00Z')
  }
];

// Sample Banks data
const banks = [
  {
    name: 'State Bank of India',
    interest_rates: {
      home_loan: { min: 6.65, max: 7.05 },
      personal_loan: { min: 10.55, max: 13.55 },
      construction_loan: { min: 6.75, max: 7.15 }
    },
    eligibility_criteria: {
      min_income: 300000,
      min_credit_score: 650,
      max_age: 70,
      employment_types: ['salaried', 'self-employed']
    },
    logo_url: 'https://example.com/banks/sbi-logo.png',
    contact_info: {
      website: 'https://www.sbi.co.in',
      toll_free: '1800-1234',
      email: 'customercare@sbi.co.in'
    },
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    name: 'HDFC Bank',
    interest_rates: {
      home_loan: { min: 6.70, max: 7.15 },
      personal_loan: { min: 10.75, max: 14.00 },
      construction_loan: { min: 6.80, max: 7.25 }
    },
    eligibility_criteria: {
      min_income: 250000,
      min_credit_score: 650,
      max_age: 65,
      employment_types: ['salaried', 'self-employed']
    },
    logo_url: 'https://example.com/banks/hdfc-logo.png',
    contact_info: {
      website: 'https://www.hdfcbank.com',
      toll_free: '1800-567-6789',
      email: 'customercare@hdfcbank.com'
    },
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    name: 'ICICI Bank',
    interest_rates: {
      home_loan: { min: 6.75, max: 7.20 },
      personal_loan: { min: 10.50, max: 13.75 },
      construction_loan: { min: 6.85, max: 7.30 }
    },
    eligibility_criteria: {
      min_income: 300000,
      min_credit_score: 650,
      max_age: 70,
      employment_types: ['salaried', 'self-employed']
    },
    logo_url: 'https://example.com/banks/icici-logo.png',
    contact_info: {
      website: 'https://www.icicibank.com',
      toll_free: '1800-103-8181',
      email: 'customercare@icicibank.com'
    },
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    name: 'Axis Bank',
    interest_rates: {
      home_loan: { min: 6.75, max: 7.25 },
      personal_loan: { min: 10.49, max: 13.99 },
      construction_loan: { min: 6.85, max: 7.35 }
    },
    eligibility_criteria: {
      min_income: 250000,
      min_credit_score: 650,
      max_age: 65,
      employment_types: ['salaried', 'self-employed']
    },
    logo_url: 'https://example.com/banks/axis-logo.png',
    contact_info: {
      website: 'https://www.axisbank.com',
      toll_free: '1800-209-5577',
      email: 'customercare@axisbank.com'
    },
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  },
  {
    name: 'Kotak Mahindra Bank',
    interest_rates: {
      home_loan: { min: 6.60, max: 7.10 },
      personal_loan: { min: 10.25, max: 15.00 },
      construction_loan: { min: 6.70, max: 7.20 }
    },
    eligibility_criteria: {
      min_income: 300000,
      min_credit_score: 650,
      max_age: 70,
      employment_types: ['salaried', 'self-employed']
    },
    logo_url: 'https://example.com/banks/kotak-logo.png',
    contact_info: {
      website: 'https://www.kotak.com',
      toll_free: '1860-266-2666',
      email: 'care@kotak.com'
    },
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z')
  }
];

// Enhanced locations with amenities, connectivity, etc.
const enhancedLocations = [
  {
    ...locations[0], // Mumbai
    amenities: {
      shopping: ['Crawford Market', 'Phoenix Mall', 'Leisure World'],
      healthcare: ['Lilavati Hospital', 'Kokilaben Hospital', 'Jaslok Hospital'],
      education: ['IIT Bombay', 'St. Xavier\'s College', 'JB Petit High School'],
      entertainment: ['Marine Drive Promenade', 'Gateway of India', 'Juhu Beach']
    },
    connectivity_score: {
      road: 9.5,
      rail: 9.8,
      air: 10.0,
      public_transport: 9.2,
      overall: 9.6
    },
    locality_highlights: [
      'One of India\'s financial capitals',
      'Home to Bollywood industry',
      'Rich colonial architecture',
      'Diverse cultural heritage',
      'World-class healthcare facilities'
    ],
    essential_services: {
      electricity: { availability: 99.8, reliability: 'excellent' },
      water: { availability: 98.5, quality: 'good' },
      sewage: { coverage: 95.2, treatment: 'advanced' },
      waste_management: { collection: 97.1, recycling: 'moderate' },
      internet: { speed: '100-500 Mbps', coverage: 98.5 }
    }
  },
  {
    ...locations[1], // Delhi
    amenities: {
      shopping: ['Connaught Place', 'Select Citywalk', 'DLF Mall'],
      healthcare: ['All India Institute of Medical Sciences', 'Apollo Hospital', 'Max Hospital'],
      education: ['Delhi University', 'Jawaharlal Nehru University', 'St. Stephen\'s College'],
      entertainment: ['Red Fort', 'India Gate', 'Lotus Temple']
    },
    connectivity_score: {
      road: 8.8,
      rail: 9.5,
      air: 10.0,
      public_transport: 8.5,
      overall: 9.2
    },
    locality_highlights: [
      'Political capital of India',
      'Rich historical monuments',
      'Cultural diversity',
      'Growing IT sector',
      'Excellent educational institutions'
    ],
    essential_services: {
      electricity: { availability: 99.5, reliability: 'good' },
      water: { availability: 97.2, quality: 'moderate' },
      sewage: { coverage: 92.8, treatment: 'good' },
      waste_management: { collection: 94.5, recycling: 'moderate' },
      internet: { speed: '50-300 Mbps', coverage: 96.8 }
    }
  },
  {
    ...locations[2], // Bangalore
    amenities: {
      shopping: ['UB City', 'Forum Mall', 'Brigade Road'],
      healthcare: ['Manipal Hospital', 'Apollo Hospital', 'Fortis Hospital'],
      education: ['IIT Bangalore', 'IISc', 'National Law School'],
      entertainment: ['Lalbagh Botanical Garden', 'Cubbon Park', 'Bangalore Palace']
    },
    connectivity_score: {
      road: 8.5,
      rail: 8.2,
      air: 9.8,
      public_transport: 8.8,
      overall: 8.8
    },
    locality_highlights: [
      'Silicon Valley of India',
      'Pleasant climate year-round',
      'Growing startup ecosystem',
      'Educational hub',
      'Tech innovation center'
    ],
    essential_services: {
      electricity: { availability: 99.2, reliability: 'excellent' },
      water: { availability: 98.1, quality: 'good' },
      sewage: { coverage: 94.7, treatment: 'advanced' },
      waste_management: { collection: 96.3, recycling: 'good' },
      internet: { speed: '100-1000 Mbps', coverage: 97.9 }
    }
  },
  {
    ...locations[3], // Chennai
    amenities: {
      shopping: ['Express Avenue', 'Forum Vijaya Mall', 'T. Nagar'],
      healthcare: ['Apollo Hospital', 'Global Hospital', 'MIOT International'],
      education: ['IIT Madras', 'Anna University', 'Loyola College'],
      entertainment: ['Marina Beach', 'Kapaleeshwarar Temple', 'Valluvar Kottam']
    },
    connectivity_score: {
      road: 8.2,
      rail: 8.8,
      air: 9.5,
      public_transport: 8.0,
      overall: 8.6
    },
    locality_highlights: [
      'Cultural capital of South India',
      'Longest urban beach in the world',
      'Automotive industry hub',
      'Rich Tamil heritage',
      'Growing IT sector'
    ],
    essential_services: {
      electricity: { availability: 98.8, reliability: 'good' },
      water: { availability: 96.5, quality: 'moderate' },
      sewage: { coverage: 91.2, treatment: 'moderate' },
      waste_management: { collection: 93.7, recycling: 'moderate' },
      internet: { speed: '50-300 Mbps', coverage: 95.4 }
    }
  },
  {
    ...locations[4], // Hyderabad
    amenities: {
      shopping: ['GVK One Mall', 'Inorbit Mall', 'Banjara Hills'],
      healthcare: ['Apollo Hospital', 'Care Hospital', 'Yashoda Hospital'],
      education: ['IIT Hyderabad', 'IIIT Hyderabad', 'Osmania University'],
      entertainment: ['Charminar', 'Golconda Fort', 'Hussain Sagar Lake']
    },
    connectivity_score: {
      road: 8.7,
      rail: 8.5,
      air: 9.7,
      public_transport: 8.3,
      overall: 8.8
    },
    locality_highlights: [
      'Pearl City of India',
      'IT and pharma hub',
      'Rich Nizam heritage',
      'Growing startup ecosystem',
      'Famous for biryani and pearls'
    ],
    essential_services: {
      electricity: { availability: 99.0, reliability: 'excellent' },
      water: { availability: 97.8, quality: 'good' },
      sewage: { coverage: 93.5, treatment: 'good' },
      waste_management: { collection: 95.1, recycling: 'moderate' },
      internet: { speed: '50-500 Mbps', coverage: 97.2 }
    }
  }
];

async function seedLocations() {
  console.log('Seeding locations...');

  // First, try to update existing locations with enhanced data
  for (const enhancedLoc of enhancedLocations) {
    try {
      const existing = await prisma.location.findFirst({
        where: { name: enhancedLoc.name }
      });

      if (existing) {
        await prisma.location.update({
          where: { id: existing.id },
          data: {
            amenities: enhancedLoc.amenities,
            connectivity_score: enhancedLoc.connectivity_score,
            locality_highlights: enhancedLoc.locality_highlights,
            essential_services: enhancedLoc.essential_services
          }
        });
        console.log(`✓ Updated location: ${enhancedLoc.name}`);
      } else {
        await prisma.location.create({ data: enhancedLoc });
        console.log(`✓ Created location: ${enhancedLoc.name}`);
      }
    } catch (error) {
      console.log(`- Error with location ${enhancedLoc.name}: ${(error as Error).message}`);
    }
  }
}

async function seedBuilders() {
  console.log('Seeding builders...');
  for (const builder of builders) {
    try {
      await prisma.builder.create({ data: builder });
      console.log(`✓ Created builder: ${builder.name}`);
    } catch (error) {
      console.log(`- Builder ${builder.name} already exists, skipping...`);
    }
  }
}

async function seedOffers() {
  console.log('Seeding offers...');
  for (const offer of offers) {
    try {
      await prisma.offer.create({ data: offer });
      console.log(`✓ Created offer: ${offer.title}`);
    } catch (error) {
      console.log(`- Offer ${offer.title} already exists, skipping...`);
    }
  }
}

async function seedBanks() {
  console.log('Seeding banks...');
  for (const bank of banks) {
    try {
      await prisma.bank.create({ data: bank });
      console.log(`✓ Created bank: ${bank.name}`);
    } catch (error) {
      console.log(`- Bank ${bank.name} already exists, skipping...`);
    }
  }
}

async function seedReraCompliances() {
  console.log('Seeding RERA compliances...');

  const properties = await prisma.property.findMany({
    where: { rera_registered: true },
    select: { id: true, title: true, rera_number: true }
  });

  for (const property of properties) {
    try {
      const compliance = {
        property_id: property.id,
        registration_number: property.rera_number || `RERA${property.id}`,
        approval_status: 'approved' as const,
        complaint_history: [
          {
            date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            type: 'delay_in_possession',
            status: 'resolved'
          }
        ],
        project_timeline: [
          {
            date: new Date(2023, 0, 15).toISOString().split('T')[0],
            event: 'Project Launch',
            completed: true
          },
          {
            date: new Date(2023, 3, 1).toISOString().split('T')[0],
            event: 'Foundation Work',
            completed: true
          },
          {
            date: new Date(2024, 6, 1).toISOString().split('T')[0],
            event: 'Structural Completion',
            completed: true
          },
          {
            date: new Date(2024, 11, 15).toISOString().split('T')[0],
            event: 'Possession Date',
            completed: false
          }
        ],
        approved_building_plans: [
          'Floor Plan Approval',
          'Structural Design Approval',
          'Electrical Layout Approval',
          'Plumbing Layout Approval'
        ]
      };

      await prisma.reraCompliance.create({ data: compliance });
      console.log(`✓ Created RERA compliance for: ${property.title}`);
    } catch (error) {
      console.log(`- RERA compliance for ${property.title} already exists, skipping...`);
    }
  }
}

async function seedLoanApplications() {
  console.log('Seeding loan applications...');

  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  const properties = await prisma.property.findMany({ select: { id: true, title: true, price: true } });
  const banksList = await prisma.bank.findMany({ select: { id: true, name: true } });

  console.log(`Found ${users.length} users, ${properties.length} properties, ${banksList.length} banks`);

  if (users.length === 0 || properties.length === 0 || banksList.length === 0) {
    console.log('Required data not found, skipping loan application seeding');
    return;
  }

  for (let i = 0; i < Math.min(10, users.length * properties.length * banksList.length); i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const property = properties[Math.floor(Math.random() * properties.length)];
    const bank = banksList[Math.floor(Math.random() * banksList.length)];

    try {
      const loanAmount = property.price ? Math.min(Number(property.price) * 0.8, 50000000) : 20000000;
      const documents = [
        { type: 'aadhar_card', status: 'verified', url: 'https://example.com/docs/aadhar.pdf' },
        { type: 'pan_card', status: 'verified', url: 'https://example.com/docs/pan.pdf' },
        { type: 'salary_slip', status: 'pending', url: 'https://example.com/docs/salary.pdf' },
        { type: 'bank_statement', status: 'verified', url: 'https://example.com/docs/bank-statement.pdf' }
      ];

      await prisma.loanApplication.create({
        data: {
          user_id: user.id,
          property_id: property.id,
          bank_id: bank.id,
          loan_amount: loanAmount,
          status: 'draft' as const,
          documents
        }
      });
      console.log(`✓ Created loan application for user: ${user.email}`);
    } catch (error) {
      console.log(`- Loan application already exists for user ${user.email}, skipping...`);
    }
  }
}

async function seedSavedSearches() {
  console.log('Seeding saved searches...');

  const users = await prisma.user.findMany({ select: { id: true, first_name: true } });

  if (users.length === 0) {
    console.log('No users found, skipping saved searches seeding');
    return;
  }

  for (const user of users.slice(0, 3)) { // Limit to first 3 users
    for (let i = 0; i < 2; i++) {
      try {
        const savedSearch = {
          user_id: user.id,
          name: `Search ${i + 1}`,
          search_query: `Residential properties in ${['Mumbai', 'Delhi', 'Bangalore'][Math.floor(Math.random() * 3)]}`,
          filters: {
            property_type: ['residential', 'commercial'][Math.floor(Math.random() * 2)],
            max_price: [5000000, 10000000, 20000000][Math.floor(Math.random() * 3)],
            bedrooms: [2, 3, 4][Math.floor(Math.random() * 3)]
          },
          location_bounds: {
            north: 19.0760 + Math.random() * 0.1,
            south: 19.0760 - Math.random() * 0.1,
            east: 72.8777 + Math.random() * 0.1,
            west: 72.8777 - Math.random() * 0.1
          },
          alert_enabled: Math.random() > 0.5
        };

        await prisma.savedSearch.create({ data: savedSearch });
        console.log(`✓ Created saved search for user: ${user.first_name || 'User'}`);
      } catch (error) {
        console.log(`- Saved search already exists, skipping...`);
      }
    }
  }
}

async function seedPropertyReviews() {
  console.log('Seeding property reviews...');

  const users = await prisma.user.findMany({ select: { id: true, first_name: true } });
  const properties = await prisma.property.findMany({ select: { id: true, title: true } });

  if (users.length === 0 || properties.length === 0) {
    console.log('Required data not found, skipping property reviews seeding');
    return;
  }

  for (const property of properties.slice(0, Math.min(5, properties.length))) {
    for (let i = 0; i < 2; i++) {
      const user = users[Math.floor(Math.random() * users.length)];

      try {
        const review = {
          user_id: user.id,
          property_id: property.id,
          rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
          review_text: [
            'Excellent property with great amenities and location.',
            'Good value for money, well-maintained building.',
            'Nice neighborhood with all essential services nearby.',
            'Modern construction with quality finishes.',
            'Peaceful locality with easy access to transportation.'
          ][Math.floor(Math.random() * 5)]
        };

        await prisma.propertyReview.create({ data: review });
        console.log(`✓ Created review for property: ${property.title}`);
      } catch (error) {
        console.log(`- Review already exists, skipping...`);
      }
    }
  }
}

async function seedCommunityForumPosts() {
  console.log('Seeding community forum posts...');

  const users = await prisma.user.findMany({ select: { id: true, first_name: true } });
  const properties = await prisma.property.findMany({ select: { id: true, title: true } });

  for (let i = 0; i < 15; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const property = i % 3 === 0 ? properties[Math.floor(Math.random() * properties.length)] : null;

    try {
      const post = {
        user_id: user.id,
        property_id: property?.id || null,
        title: [
          'Best schools in the locality?',
          'Parking availability in the building',
          'Recent developments in the area',
          'Maintenance charges and amenities',
          'Connectivity to metro station',
          'Nearby hospitals and medical facilities',
          'Shopping options within 5km',
          'Property appreciation potential',
          'Builder reputation and past projects',
          'Resale value analysis'
        ][Math.floor(Math.random() * 10)],
        content: [
          'Hi everyone, I\'m considering buying a property here. Can someone share information about the schools in this locality?',
          'Does anyone know about the parking situation? Is there adequate parking for residents and guests?',
          'Are there any upcoming infrastructure projects in this area that might affect property values?',
          'What are the monthly maintenance charges? Are there any hidden costs I should be aware of?',
          'How is the connectivity to the nearest metro station? Any issues with traffic or transportation?'
        ][Math.floor(Math.random() * 5)],
        replies: [
          {
            user_id: users[Math.floor(Math.random() * users.length)].id,
            content: 'Great question! Let me share my experience...',
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };

      await prisma.communityForumPost.create({ data: post });
      console.log(`✓ Created forum post: ${post.title}`);
    } catch (error) {
      console.log(`- Forum post already exists, skipping...`);
    }
  }
}

async function seedViewingSchedulers() {
  console.log('Seeding viewing schedulers...');

  const users = await prisma.user.findMany({ select: { id: true, first_name: true } });
  const properties = await prisma.property.findMany({ select: { id: true, title: true } });

  if (users.length === 0 || properties.length === 0) {
    console.log('Required data not found, skipping viewing schedulers seeding');
    return;
  }

  for (let i = 0; i < Math.min(12, users.length * properties.length); i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const property = properties[Math.floor(Math.random() * properties.length)];

    try {
      const scheduledAt = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Next 30 days
      const viewing = {
        user_id: user.id,
        property_id: property.id,
        scheduled_at: scheduledAt,
        status: 'scheduled' as const,
        notes: Math.random() > 0.5 ? 'Interested in 3BHK units on higher floors' : null
      };

      await prisma.viewingScheduler.create({ data: viewing });
      console.log(`✓ Created viewing schedule for user: ${user.first_name || 'User'}`);
    } catch (error) {
      console.log(`- Viewing schedule already exists, skipping...`);
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

    await seedBuilders();
    console.log('');

    await seedOffers();
    console.log('');

    await seedBanks();
    console.log('');

    await seedProperties();
    console.log('');

    await seedReraCompliances();
    console.log('');

    await seedLoanApplications();
    console.log('');

    await seedSavedSearches();
    console.log('');

    await seedPropertyReviews();
    console.log('');

    await seedCommunityForumPosts();
    console.log('');

    await seedViewingSchedulers();
    console.log('');

    // await seedMongoDBContent();
    // console.log('');

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