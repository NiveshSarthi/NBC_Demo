import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingUp, Building, Users, Home, Factory, Waves, Mountain } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Locations - NextBoomCity',
  description: 'Explore real estate opportunities in India\'s emerging boom cities including Faridabad, Dholera, Vrindavan, Ayodhya, Hyderabad, and Goa.',
  keywords: 'locations, cities, real estate, Faridabad, Dholera, Vrindavan, Ayodhya, Hyderabad, Goa, investment opportunities',
};

interface CityData {
  id: string;
  name: string;
  state: string;
  description: string;
  image: string;
  propertyCount: number;
  avgPrice: string;
  growthRate: string;
  type: 'residential' | 'commercial' | 'industrial' | 'tourism' | 'religious';
  highlights: string[];
  status: 'active' | 'developing' | 'upcoming';
}

const cities: CityData[] = [
  {
    id: 'faridabad',
    name: 'Faridabad',
    state: 'Haryana',
    description: 'Delhi NCR\'s fastest-growing residential and commercial hub with excellent connectivity and modern infrastructure.',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    propertyCount: 1250,
    avgPrice: '₹85L - ₹2.5Cr',
    growthRate: '+18%',
    type: 'residential',
    highlights: ['Delhi Metro Connectivity', 'Industrial Growth', 'Educational Hubs', 'Modern Townships'],
    status: 'active'
  },
  {
    id: 'dholera',
    name: 'Dholera',
    state: 'Gujarat',
    description: 'India\'s first smart industrial city with world-class infrastructure and strategic location near Ahmedabad.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    propertyCount: 450,
    avgPrice: '₹45L - ₹15Cr',
    growthRate: '+25%',
    type: 'industrial',
    highlights: ['Smart City Status', 'Port Connectivity', 'Industrial Parks', 'International Airport'],
    status: 'developing'
  },
  {
    id: 'vrindavan',
    name: 'Vrindavan',
    state: 'Uttar Pradesh',
    description: 'Sacred city of Krishna with growing residential and religious tourism real estate opportunities.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    propertyCount: 320,
    avgPrice: '₹35L - ₹85L',
    growthRate: '+22%',
    type: 'residential',
    highlights: ['ISKCON Temple', 'Religious Tourism', 'Modern Apartments', 'Cultural Heritage'],
    status: 'active'
  },
  {
    id: 'ayodhya',
    name: 'Ayodhya',
    state: 'Uttar Pradesh',
    description: 'Ancient city with massive development potential following the Ram Mandir construction and spiritual tourism growth.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    propertyCount: 280,
    avgPrice: '₹40L - ₹12Cr',
    growthRate: '+30%',
    type: 'religious',
    highlights: ['Ram Mandir Complex', 'Spiritual Tourism', 'Heritage Development', 'Infrastructure Projects'],
    status: 'developing'
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    description: 'Tech capital of India with booming IT sector, pharma industry, and modern residential developments.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    propertyCount: 890,
    avgPrice: '₹65L - ₹25Cr',
    growthRate: '+20%',
    type: 'commercial',
    highlights: ['IT & Pharma Hub', 'Hi-Tech City', 'International Airport', 'Educational Institutions'],
    status: 'active'
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    description: 'Coastal paradise with luxury beachfront properties, tourism infrastructure, and international appeal.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
    propertyCount: 410,
    avgPrice: '₹75L - ₹18Cr',
    growthRate: '+15%',
    type: 'tourism',
    highlights: ['Beachfront Properties', 'International Tourism', 'Luxury Resorts', 'Portuguese Heritage'],
    status: 'active'
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    description: 'Education and IT hub with growing residential and commercial real estate market.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    propertyCount: 680,
    avgPrice: '₹55L - ₹8Cr',
    growthRate: '+16%',
    type: 'residential',
    highlights: ['Educational Hub', 'IT Parks', 'Hinjewadi', 'Quality of Life'],
    status: 'active'
  },
  {
    id: 'gurugram',
    name: 'Gurugram',
    state: 'Haryana',
    description: 'Corporate hub of India with premium commercial spaces and luxury residential developments.',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
    propertyCount: 950,
    avgPrice: '₹1.2Cr - ₹15Cr',
    growthRate: '+14%',
    type: 'commercial',
    highlights: ['Cyber City', 'DLF Headquarters', 'Metro Connectivity', 'International Schools'],
    status: 'active'
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    description: 'Pink City with heritage tourism potential and growing residential real estate market.',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',
    propertyCount: 320,
    avgPrice: '₹35L - ₹2.5Cr',
    growthRate: '+12%',
    type: 'tourism',
    highlights: ['Heritage Tourism', 'Pink City Charm', 'Royal Palaces', 'Modern Developments'],
    status: 'active'
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    description: 'Southern gateway with IT corridor, automotive industry, and coastal real estate opportunities.',
    image: 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=800&q=80',
    propertyCount: 720,
    avgPrice: '₹45L - ₹6Cr',
    growthRate: '+17%',
    type: 'commercial',
    highlights: ['IT Corridor', 'Automotive Hub', 'Port Connectivity', 'Educational Excellence'],
    status: 'active'
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    description: 'Business capital of Gujarat with textile industry heritage and modern commercial developments.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    propertyCount: 580,
    avgPrice: '₹38L - ₹4.5Cr',
    growthRate: '+19%',
    type: 'commercial',
    highlights: ['Textile Industry', 'GIFT City Proximity', 'Cultural Heritage', 'Modern Infrastructure'],
    status: 'active'
  },
  {
    id: 'lucknow',
    name: 'Lucknow',
    state: 'Uttar Pradesh',
    description: 'Capital city with administrative importance and growing commercial real estate potential.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    propertyCount: 390,
    avgPrice: '₹32L - ₹3.2Cr',
    growthRate: '+13%',
    type: 'commercial',
    highlights: ['State Capital', 'Administrative Hub', 'Cultural Heritage', 'Medical Tourism'],
    status: 'active'
  }
];

const getTypeIcon = (type: CityData['type']) => {
  switch (type) {
    case 'residential':
      return <Home className="h-5 w-5" />;
    case 'commercial':
      return <Building className="h-5 w-5" />;
    case 'industrial':
      return <Factory className="h-5 w-5" />;
    case 'tourism':
      return <Waves className="h-5 w-5" />;
    case 'religious':
      return <Mountain className="h-5 w-5" />;
  }
};

const getStatusColor = (status: CityData['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'developing':
      return 'bg-orange-500';
    case 'upcoming':
      return 'bg-blue-500';
  }
};

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore India's Boom Cities
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover investment opportunities in India's fastest-growing cities with comprehensive market data and property insights
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">{cities.length}</div>
              <div className="text-gray-600 text-sm">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">
                {cities.reduce((sum, city) => sum + city.propertyCount, 0).toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Properties Listed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">+18%</div>
              <div className="text-gray-600 text-sm">Avg Growth Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">₹500Cr+</div>
              <div className="text-gray-600 text-sm">Investment Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Card key={city.id} className="overflow-hidden hover:shadow-xl transition-all group">
              <div className="relative h-48">
                <Image
                  src={city.image}
                  alt={`${city.name} cityscape`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <Badge className={`${getStatusColor(city.status)} text-white border-0`}>
                    {city.status}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {getTypeIcon(city.type)}
                    <span className="ml-1 capitalize">{city.type}</span>
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{city.name}</h3>
                  <p className="text-sm text-gray-200">{city.state}</p>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <TrendingUp className="h-4 w-4 text-white inline mr-1" />
                    <span className="text-white font-semibold">{city.growthRate}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {city.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Properties:</span>
                    <div className="font-semibold text-blue-600">{city.propertyCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg Price:</span>
                    <div className="font-semibold text-green-600">{city.avgPrice}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Key Highlights:</h4>
                  <div className="flex flex-wrap gap-1">
                    {city.highlights.slice(0, 3).map((highlight, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/locations/${city.id}`}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Explore {city.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Can't Find Your City?
            </h2>
            <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
              We're continuously expanding our coverage. Contact us to get market insights for other emerging cities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  <Users className="mr-2 h-5 w-5" />
                  Contact Our Team
                </Link>
              </Button>
              <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border border-white/20" asChild>
                <Link href="/market-reports">
                  View Market Reports
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}