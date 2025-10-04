import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Building, Users, ArrowLeft, Plane, Train, Car, Zap } from "lucide-react";

interface LocationPageProps {
  params: Promise<{
    city: string;
  }>;
}

// City-specific data
const cityData: Record<string, {
  name: string;
  fullName: string;
  avgPrice: string;
  avgRent: string;
  avgROI: string;
  avgRentalYield: string;
  propertiesCount: string;
  growthRate: string;
  description: string;
  investmentReasons: string[];
  keyHighlights: {
    infrastructure: string[];
    advantages: string[];
  };
  uniqueSellingPoints: string[];
  targetAudience: string;
}> = {
  mumbai: {
    name: "Mumbai",
    fullName: "Mumbai, Maharashtra",
    avgPrice: "₹3.5Cr",
    avgRent: "₹1.5L/month",
    avgROI: "12%",
    avgRentalYield: "5.1%",
    propertiesCount: "45,000+",
    growthRate: "8%",
    description: "Mumbai, the financial capital of India, offers unparalleled investment opportunities in one of the country's most dynamic real estate markets.",
    investmentReasons: [
      "Strong rental yields from corporate professionals and expatriates",
      "Limited land availability drives consistent appreciation",
      "Excellent infrastructure with metro, airports, and expressways",
      "Home to India's financial hub and major corporations"
    ],
    keyHighlights: {
      infrastructure: ["Chhatrapati Shivaji Maharaj International Airport", "Mumbai Metro", "Eastern Freeway", "Bandra-Worli Sea Link"],
      advantages: ["Highest rental yields in India", "Prime commercial locations", "World-class amenities", "Strategic business hub"]
    },
    uniqueSellingPoints: ["Marine Drive premium properties", "Bandra-Kurla Complex commercial hub", "Upcoming Navi Mumbai developments"],
    targetAudience: "Investors seeking stable returns and long-term appreciation"
  },
  delhi: {
    name: "Delhi",
    fullName: "Delhi, NCR",
    avgPrice: "₹2.8Cr",
    avgRent: "₹85K/month",
    avgROI: "10%",
    avgRentalYield: "3.6%",
    propertiesCount: "52,000+",
    growthRate: "7%",
    description: "Delhi NCR, the political capital and gateway to North India, combines historical significance with modern development opportunities.",
    investmentReasons: [
      "Political and administrative capital with stable demand",
      "Growing IT and education sectors driving housing demand",
      "Excellent connectivity to major North Indian cities",
      "Government employee housing schemes and PPP projects"
    ],
    keyHighlights: {
      infrastructure: ["Indira Gandhi International Airport", "Delhi Metro", "Delhi-Mumbai Expressway", "Smart City initiatives"],
      advantages: ["Government employee concentration", "Educational hub", "Medical tourism destination", "Cultural heritage sites"]
    },
    uniqueSellingPoints: ["Gurgaon corporate hubs", "Noida IT parks", "Greater Noida affordable housing"],
    targetAudience: "Conservative investors and end-users seeking quality living"
  },
  bangalore: {
    name: "Bangalore",
    fullName: "Bangalore, Karnataka",
    avgPrice: "₹1.8Cr",
    avgRent: "₹75K/month",
    avgROI: "14%",
    avgRentalYield: "5.0%",
    propertiesCount: "38,000+",
    growthRate: "9%",
    description: "Bangalore, India's Silicon Valley, leads the technology revolution with world-class infrastructure and innovation ecosystem.",
    investmentReasons: [
      "IT and tech hub attracting global talent and companies",
      "Young population driving rental and residential demand",
      "Government focus on technology and innovation parks",
      "Growing startup ecosystem and entrepreneurial culture"
    ],
    keyHighlights: {
      infrastructure: ["Kempegowda International Airport", "Namma Metro", "Bangalore-Mysore Expressway", "Smart City ranking"],
      advantages: ["Highest IT salaries in India", "Young demographic", "Quality education institutions", "Innovation districts"]
    },
    uniqueSellingPoints: ["Whitefield IT corridor", "Electronic City tech parks", "Sarjapur Road startup hub"],
    targetAudience: "Tech professionals and investors in emerging tech sectors"
  },
  chennai: {
    name: "Chennai",
    fullName: "Chennai, Tamil Nadu",
    avgPrice: "₹1.2Cr",
    avgRent: "₹45K/month",
    avgROI: "11%",
    avgRentalYield: "4.5%",
    propertiesCount: "35,000+",
    growthRate: "6%",
    description: "Chennai, the cultural capital of South India, combines tradition with modern industrial and automotive excellence.",
    investmentReasons: [
      "Strong automotive and manufacturing base",
      "Growing IT and BPO sector presence",
      "Stable demand from government and public sector employees",
      "Lower entry costs compared to other metros"
    ],
    keyHighlights: {
      infrastructure: ["Chennai International Airport", "Chennai Metro", "Chennai-Bangalore Expressway", "Port development"],
      advantages: ["Manufacturing hub", "Educational excellence", "Cultural tourism", "Cost-effective living"]
    },
    uniqueSellingPoints: ["OMR IT corridor", "ECR beachfront properties", "T. Nagar commercial district"],
    targetAudience: "Value investors and families seeking affordable quality housing"
  },
  hyderabad: {
    name: "Hyderabad",
    fullName: "Hyderabad, Telangana",
    avgPrice: "₹1.5Cr",
    avgRent: "₹55K/month",
    avgROI: "13%",
    avgRentalYield: "4.4%",
    propertiesCount: "42,000+",
    growthRate: "10%",
    description: "Hyderabad, the City of Pearls, emerges as a pharmaceutical and IT powerhouse with excellent growth potential.",
    investmentReasons: [
      "Pharmaceutical and biotech hub of India with 40% of national production",
      "Growing IT and software export zone with Hyderabad as digital capital",
      "Rajiv Gandhi International Airport connectivity with direct international flights",
      "Government focus on healthcare, education, and innovation sectors",
      "Charminar Heritage City development with UNESCO World Heritage potential",
      "Hyderabad Knowledge City with IIT, IIM, and AIIMS integration",
      "Largest Special Economic Zone in India with unlimited FDI potential",
      "Metropolitan Development Authority master plan with ₹1 lakh crore investment",
      "Growing medical tourism with world-class hospitals and healthcare facilities",
      "Innovation districts and startup ecosystem with T-Hub support",
      "Logistics hub with multimodal connectivity and inland container depot",
      "Film city development and entertainment industry growth",
      "Renewable energy capital with solar and green energy initiatives",
      "Sports tourism with upcoming international stadiums and sports complex"
    ],
    keyHighlights: {
      infrastructure: ["Rajiv Gandhi International Airport", "Hyderabad Metro", "Hyderabad-Bangalore Expressway", "HITEC City", "Charminar Heritage Zone", "Knowledge City", "Largest SEZ in India", "Multi-modal Logistics Hub"],
      advantages: ["Pharma capital of India (40% production)", "Digital capital status", "Airport city connectivity", "Medical tourism hub", "Innovation ecosystem", "Heritage tourism", "Educational excellence", "Special economic zones"]
    },
    uniqueSellingPoints: ["HITEC City IT park", "Gachibowli financial district", "Kondapur tech corridor", "Charminar UNESCO site", "Hyderabad Knowledge City", "Largest SEZ development", "T-Hub innovation district", "Medical tourism facilities", "Film city complex", "Sports tourism venues"],
    targetAudience: "Healthcare and pharma investors, IT professionals"
  },
  goa: {
    name: "Goa",
    fullName: "Panaji, Goa",
    avgPrice: "₹2.2Cr",
    avgRent: "₹1.2L/month",
    avgROI: "16%",
    avgRentalYield: "6.5%",
    propertiesCount: "18,000+",
    growthRate: "12%",
    description: "Goa, India's tourism paradise, offers unique coastal real estate opportunities with tourism-driven growth potential.",
    investmentReasons: [
      "Premium tourism destination with international appeal",
      "Short-term rental market through platforms like Airbnb and Ola Stay",
      "Limited land availability driving consistent price appreciation",
      "Growing international investor interest with NRI-friendly policies",
      "Special Economic Zone status for certain areas with tax benefits",
      "Upcoming international airport expansion and new terminal",
      "Beachfront property development along 160km coastline",
      "Growing cruise tourism and international yacht marina development",
      "Heritage tourism with UNESCO World Heritage site potential",
      "Adventure tourism growth: water sports, trekking, wildlife safaris",
      "Medical tourism with world-class healthcare facilities planned",
      "Green energy initiatives and eco-tourism development",
      "Connectivity improvements: Mumbai-Goa expressway, Konkan railway"
    ],
    keyHighlights: {
      infrastructure: ["Goa International Airport (Expansion)", "NH-66 Expressway", "Mumbai-Goa Expressway", "Port connectivity", "Beachfront developments", "Yacht marina", "Konkan Railway"],
      advantages: ["Tourism revenue growth", "International lifestyle", "Holiday home market", "Tax benefits for NRI investors", "Eco-tourism potential", "Adventure tourism", "Medical tourism", "Heritage tourism"]
    },
    uniqueSellingPoints: ["Calangute beach properties", "South Goa villa developments", "North Goa commercial spaces", "UNESCO heritage sites", "Adventure tourism spots", "Yacht marina development", "Green energy initiatives", "Medical tourism facilities"],
    targetAudience: "NRI investors, holiday home buyers, tourism entrepreneurs"
  },
  kolkata: {
    name: "Kolkata",
    fullName: "Kolkata, West Bengal",
    avgPrice: "₹1.1Cr",
    avgRent: "₹35K/month",
    avgROI: "9%",
    avgRentalYield: "3.8%",
    propertiesCount: "28,000+",
    growthRate: "5%",
    description: "Kolkata, the cultural capital of India, offers affordable entry into one of the country's most historic real estate markets.",
    investmentReasons: [
      "Lowest property prices among major Indian cities",
      "Growing port and industrial activities",
      "Cultural and educational significance",
      "Upcoming metro and infrastructure projects"
    ],
    keyHighlights: {
      infrastructure: ["Netaji Subhas Chandra Bose International Airport", "Kolkata Metro", "Port connectivity", "Smart City initiatives"],
      advantages: ["Most affordable metro", "Rich cultural heritage", "Educational institutions", "Port-driven economy"]
    },
    uniqueSellingPoints: ["Salt Lake IT sector", "New Town developments", "Rajarhat upcoming projects"],
    targetAudience: "Budget-conscious investors seeking long-term holding"
  },
  ncr: {
    name: "NCR",
    fullName: "National Capital Region",
    avgPrice: "₹2.2Cr",
    avgRent: "₹62K/month",
    avgROI: "18%",
    avgRentalYield: "3.4%",
    propertiesCount: "180,000+",
    growthRate: "12%",
    description: "NCR, India's largest urban agglomeration, encompasses Delhi and its satellite cities, representing the country's economic powerhouse with unmatched growth potential.",
    investmentReasons: [
      "Delhi-NCR has 55 million population (larger than many countries)",
      "India's economic and political capital with highest job creation",
      "Multi-city ecosystem: Delhi, Noida, Gurgaon, Ghaziabad, Faridabad",
      "Delhi Metro network connecting all NCR cities seamlessly",
      "Expressway connectivity: Yamuna Expressway, Noida-Greater Noida Expressway",
      "Upcoming regional connectivity: Jewar Airport, rapid rail corridors",
      "Government focus on NCR development through multiple master plans",
      "Highest concentration of corporate headquarters and government offices"
    ],
    keyHighlights: {
      infrastructure: ["Delhi Metro Network", "Yamuna Expressway", "Noida-Greater Noida Expressway", "Jewar International Airport", "Regional Rapid Transit System", "Multiple Industrial Corridors", "Smart City Developments"],
      advantages: ["Massive population base", "Economic powerhouse", "Multi-modal connectivity", "Government focus", "Corporate headquarters", "Job creation hub", "Infrastructure investments"]
    },
    uniqueSellingPoints: ["55 million population", "Multi-city ecosystem", "Delhi Metro connectivity", "Expressway networks", "Corporate headquarters", "Government offices", "International airport access"],
    targetAudience: "Large institutional investors, multinational corporations, and investors seeking diversified NCR exposure"
  },
  faridabad: {
    name: "Faridabad",
    fullName: "Faridabad, Haryana",
    avgPrice: "₹1.95Cr",
    avgRent: "₹65K/month",
    avgROI: "15%",
    avgRentalYield: "4.0%",
    propertiesCount: "25,000+",
    growthRate: "14%",
    description: "Faridabad, a prominent satellite city of Delhi NCR, offers exceptional connectivity and infrastructure development driving rapid real estate growth.",
    investmentReasons: [
      "Strategic location in Delhi NCR with excellent connectivity",
      "FNG Expressway connecting Faridabad-Noida-Gurugram for seamless travel",
      "Mumbai Expressway providing direct access to Mumbai and western markets",
      "Jewar Airport (Noida International Airport) within 45-minute reach",
      "Growing industrial and residential demand from Delhi commuters",
      "Proximity to Delhi with 30-40% lower property prices",
      "Government focus on infrastructure development and smart city initiatives"
    ],
    keyHighlights: {
      infrastructure: ["Delhi Metro connectivity", "FNG Expressway", "Mumbai Expressway", "Jewar Airport (45 min)", "NH-44 Highway", "Proposed Regional Rapid Transit System", "Smart City initiatives"],
      advantages: ["Delhi proximity", "Multi-modal connectivity", "Industrial growth", "Affordable pricing", "Airport accessibility", "Expressway networks"]
    },
    uniqueSellingPoints: ["Sector 89 developments", "BPTP projects", "FNG Expressway proximity", "Jewar Airport catchment", "Educational institutions", "Medical facilities"],
    targetAudience: "Delhi commuters and first-time investors"
  },
  dholera: {
    name: "Dholera",
    fullName: "Dholera, Gujarat",
    avgPrice: "₹2.8Cr",
    avgRent: "₹45K/month",
    avgROI: "22%",
    avgRentalYield: "1.9%",
    propertiesCount: "15,000+",
    growthRate: "18%",
    description: "Dholera, Gujarat's first planned smart city, represents India's most ambitious infrastructure project with massive growth potential and international investment appeal.",
    investmentReasons: [
      "India's first smart city project with 920 sq km development area",
      "Direct access to international shipping port and airport",
      "Upcoming high-speed rail connectivity (Bullet Train)",
      "DMIC (Delhi-Mumbai Industrial Corridor) hub with unlimited FDI potential",
      "Special Investment Region (SIR) with tax incentives",
      "Upcoming international airport and container port",
      "Proximity to Ahmedabad (45 min) and Mumbai (3.5 hours)",
      "Master plan designed by world-renowned architects"
    ],
    keyHighlights: {
      infrastructure: ["International Airport (Upcoming)", "Container Port (Phase 1 Complete)", "Bullet Train Station (Upcoming)", "DMIC Industrial Corridor", "Smart City Infrastructure", "High-Speed Rail", "International Shipping Hub"],
      advantages: ["Unlimited FDI potential", "Tax incentives", "World-class infrastructure", "Strategic location", "Industrial growth", "Port connectivity", "Airport accessibility"]
    },
    uniqueSellingPoints: ["920 sq km master planned city", "International shipping port", "Bullet train connectivity", "DMIC hub", "Special Investment Region", "Zero pollution zones", "Green energy initiatives"],
    targetAudience: "International investors, industrial developers, and long-term investors seeking maximum appreciation"
  },
  ayodhya: {
    name: "Ayodhya",
    fullName: "Ayodhya, Uttar Pradesh",
    avgPrice: "₹2.1Cr",
    avgRent: "₹55K/month",
    avgROI: "25%",
    avgRentalYield: "3.1%",
    propertiesCount: "12,000+",
    growthRate: "16%",
    description: "Ayodhya, the birthplace of Lord Rama, is undergoing unprecedented transformation with the Ram Mandir development, positioning it as India's premier religious tourism destination.",
    investmentReasons: [
      "Ram Mandir inauguration (December 2024) - India's largest religious tourism project",
      "₹25,000+ crore development master plan over next decade",
      "International airport under construction with flights to global destinations",
      "High-speed rail connectivity to major cities",
      "Medical city development with world-class healthcare facilities",
      "Educational hub with IIT, IIM, and Central University",
      "Heritage tourism destination with UNESCO World Heritage status potential",
      "Government-backed development with guaranteed infrastructure investment"
    ],
    keyHighlights: {
      infrastructure: ["Ram Mandir Complex", "International Airport (Under Construction)", "High-Speed Rail Station", "Medical City (Upcoming)", "IIT Campus (Upcoming)", "IIM Campus (Upcoming)", "Central University"],
      advantages: ["Religious significance", "Tourism revenue growth", "Government investment", "Infrastructure development", "Cultural importance", "Medical tourism", "Educational excellence"]
    },
    uniqueSellingPoints: ["Ram Mandir pilgrimage site", "International airport", "Medical city", "Educational institutions", "Heritage tourism", "Ramayana Circuit development", "Cultural tourism hub"],
    targetAudience: "Religious investors, tourism developers, and long-term value investors seeking cultural significance"
  },
  vrindavan: {
    name: "Vrindavan",
    fullName: "Vrindavan, Uttar Pradesh",
    avgPrice: "₹1.4Cr",
    avgRent: "₹45K/month",
    avgROI: "18%",
    avgRentalYield: "3.9%",
    propertiesCount: "8,000+",
    growthRate: "15%",
    description: "Vrindavan, the sacred land of Lord Krishna, is experiencing unprecedented development with ISKCON temples, heritage tourism, and spiritual real estate growth.",
    investmentReasons: [
      "Spiritual capital of Hindu faith with millions of annual pilgrims",
      "ISKCON temple complex expansion with international tourism",
      "UNESCO World Heritage potential with ancient temples and ghats",
      "Growing international spiritual tourism from global Hindu diaspora",
      "Heritage city development with preservation and modernization",
      "Medical tourism integration with spiritual healing centers",
      "Educational institutions and gurukul development",
      "Infrastructure development for better connectivity and amenities",
      "Cultural tourism with festivals, art, and traditional crafts",
      "Sustainable tourism development with eco-friendly initiatives"
    ],
    keyHighlights: {
      infrastructure: ["ISKCON Temple Complex", "Yamuna River Ghats", "Krishna Balaram Temple", "Banke Bihari Temple", "Prem Mandir", "Nidhivan Temple Area", "Parikrama Marg", "Tourism Development"],
      advantages: ["Religious significance", "Pilgrim tourism", "Spiritual tourism", "Heritage preservation", "Cultural importance", "International appeal", "Sustainable development", "Community focus"]
    },
    uniqueSellingPoints: ["Krishna's birthplace", "ISKCON temples", "Yamuna ghats", "Spiritual tourism", "Heritage sites", "Pilgrim accommodation", "Cultural festivals", "Traditional crafts"],
    targetAudience: "Religious investors, spiritual tourism developers, cultural heritage enthusiasts, and long-term spiritual real estate investors"
  },
  ahmedabad: {
    name: "Ahmedabad",
    fullName: "Ahmedabad, Gujarat",
    avgPrice: "₹1.3Cr",
    avgRent: "₹42K/month",
    avgROI: "8%",
    avgRentalYield: "3.9%",
    propertiesCount: "32,000+",
    growthRate: "11%",
    description: "Ahmedabad, Gujarat's commercial capital, benefits from the state's business-friendly policies and infrastructure development.",
    investmentReasons: [
      "Gujarat's economic growth and FDI attraction",
      "DMIC (Delhi-Mumbai Industrial Corridor) connectivity",
      "Manufacturing and textile industry presence",
      "Growing as educational and healthcare hub"
    ],
    keyHighlights: {
      infrastructure: ["Sardar Vallabhbhai Patel International Airport", "Ahmedabad Metro", "DMIC Expressway", "Smart City status"],
      advantages: ["Industrial growth", "Business-friendly policies", "Educational institutions", "Cultural heritage"]
    },
    uniqueSellingPoints: ["GIFT City financial hub", "SG Highway IT corridor", "Bopal-Satellite developments"],
    targetAudience: "Industrial investors and families seeking affordable metro living"
  }
};

export default async function LocationPage({ params }: LocationPageProps) {
  const { city } = await params;
  const cityInfo = cityData[city.toLowerCase()] || {
    name: city.charAt(0).toUpperCase() + city.slice(1),
    fullName: city.charAt(0).toUpperCase() + city.slice(1),
    avgPrice: "₹2.5Cr",
    avgROI: "12%",
    propertiesCount: "25,000+",
    growthRate: "8%",
    description: `${city.charAt(0).toUpperCase() + city.slice(1)} is an emerging city with excellent investment potential and growing infrastructure.`,
    investmentReasons: [
      "Growing economy and job opportunities",
      "Infrastructure development projects",
      "Increasing population and demand",
      "Government initiatives for urban development"
    ],
    keyHighlights: {
      infrastructure: ["Modern airport", "Metro connectivity", "Expressway access", "Smart city features"],
      advantages: ["Economic growth", "Quality infrastructure", "Investment potential", "Urban development"]
    },
    uniqueSellingPoints: ["Prime locations", "Modern developments", "Commercial hubs"],
    targetAudience: "Investors seeking growth opportunities"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-16">
          <Link href="/" className="inline-flex items-center text-blue-200 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{cityInfo.name}</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl">
            {cityInfo.description}
          </p>

          {/* Key Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{cityInfo.avgPrice}</div>
              <div className="text-blue-200">Avg. Property Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{cityInfo.avgRent}</div>
              <div className="text-blue-200">Avg. Monthly Rent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{cityInfo.avgRentalYield}</div>
              <div className="text-blue-200">Rental Yield</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">{cityInfo.avgROI}</div>
              <div className="text-blue-200">Avg. Annual ROI</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Overview Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Why Invest in {cityInfo.name}?</h2>
            <div className="space-y-4 text-gray-700">
              <p>{cityInfo.description}</p>
              <p>{cityInfo.targetAudience}</p>
            </div>

            <div className="mt-8 space-y-3">
              {cityInfo.investmentReasons.map((reason, index) => (
                <div key={index} className="flex items-start">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">Key Infrastructure</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Plane className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-green-600 mb-1">Airport</div>
                  <div className="text-xs text-gray-600">{cityInfo.keyHighlights.infrastructure[0] || "International Airport"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Train className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-blue-600 mb-1">Metro/Transit</div>
                  <div className="text-xs text-gray-600">{cityInfo.keyHighlights.infrastructure[1] || "Rapid Transit System"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Car className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-orange-600 mb-1">Connectivity</div>
                  <div className="text-xs text-gray-600">{cityInfo.keyHighlights.infrastructure[2] || "High-Speed Corridor"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-purple-600 mb-1">Development</div>
                  <div className="text-xs text-gray-600">{cityInfo.keyHighlights.infrastructure[3] || "Modern Infrastructure"}</div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <h4 className="font-semibold mb-4">Key Advantages</h4>
              <div className="space-y-2">
                {cityInfo.keyHighlights.advantages.map((advantage, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    {advantage}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Property Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Property Types in {cityInfo.name}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Residential</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Modern apartments and villas with premium amenities
                </p>
                <Button variant="outline" asChild>
                  <Link href={`/properties?location=${city}&type=residential`}>
                    View Properties
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Commercial</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Office spaces and retail properties in prime locations
                </p>
                <Button variant="outline" asChild>
                  <Link href={`/properties?location=${city}&type=commercial`}>
                    View Properties
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Plots & Land</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Investment opportunities in developing areas
                </p>
                <Button variant="outline" asChild>
                  <Link href={`/properties?location=${city}&type=plots`}>
                    View Properties
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Religious</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Properties near temples and religious sites
                </p>
                <Button variant="outline" asChild>
                  <Link href={`/properties?location=${city}&type=religious`}>
                    View Properties
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Projects */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-orange-500">Featured</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Premium Project {i + 1}</h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    Prime Location, {cityInfo.name}
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="font-bold text-green-600">₹2.5Cr onwards</div>
                      <div className="text-sm text-gray-600">2, 3 & 4 BHK</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">ROI: 14%</div>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/projects/project-${i + 1}`}>View Project</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Investment Guide */}
        <div className="bg-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Invest in {cityInfo.name}?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get our comprehensive investment guide for {cityInfo.name} with detailed market analysis,
            price trends, and expert recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/market-reports">
                View Market Reports
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/contact?subject=${encodeURIComponent(`${cityInfo.name} Investment Inquiry`)}`}>
                Contact Expert
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}