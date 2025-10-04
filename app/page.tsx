'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, MapPin, TrendingUp, Users, Building, Award, Eye, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import { SchemaMarkup } from "@/components/seo/SchemaMarkup";
import { PropertyARViewer } from "@/components/ar/PropertyARViewer";
import { VirtualTourViewer } from "@/components/virtual-tour/VirtualTourViewer";
import { DynamicBanner } from "@/components/offers/DynamicBanner";
import AIChatbot from "@/components/ai/AIChatbot";
import { PropertyCard } from "@/components/properties/PropertyCard";


export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [arModalOpen, setArModalOpen] = useState(false);
  const [virtualTourModalOpen, setVirtualTourModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<{
    title: string;
    id: string;
    images?: string[];
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only enable modal functionality after hydration
  const handleOpenARModal = (property: { title: string; id: string }) => {
    if (mounted) {
      setCurrentProperty(property);
      setArModalOpen(true);
    }
  };

  const handleOpenVirtualTourModal = (property: { title: string; id: string; images: string[] }) => {
    if (mounted) {
      setCurrentProperty(property);
      setVirtualTourModalOpen(true);
    }
  };


  // Demo images for virtual tours
  const faridabadImages = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
  ];

  const vrindavanImages = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80"
  ];

  const dholeraImages = [
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
  ];

  const hyderabadImages = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    "https://images.unsplash.com/photo-1566479179817-7e083dc2c9b0?w=800&q=80"
  ];

  const ayodhyaImages = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80"
  ];

  const goaImages = [
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"
  ];

  // Demo properties data for PropertyCard components
  const demoProperties = [
    {
      id: 'home-demo-1',
      title: 'Luxury Villa in Faridabad',
      description: 'Premium villa with modern amenities and excellent connectivity',
      property_type: 'residential',
      listing_type: 'sale',
      sub_type: 'Villa',
      city: 'Faridabad',
      state: 'Haryana',
      address: 'Sector 89, Faridabad',
      pincode: '121001',
      latitude: 28.4089,
      longitude: 77.3178,
      price: 2500000,
      rent_amount: null,
      rent_period: null,
      price_unit: 'INR',
      area: 2500,
      area_unit: 'sqft',
      bedrooms: 3,
      bathrooms: 4,
      parking_spaces: 2,
      floor_number: null,
      total_floors: null,
      year_built: 2022,
      furnishing: 'semi_furnished',
      amenities: ['Swimming Pool', 'Garden', 'Security', 'Power Backup', 'Lift'],
      features: ['Corner Plot', 'Modular Kitchen', 'Air Conditioning'],
      rera_registered: true,
      rera_number: 'HR/12345/2022',
      ownership_type: 'freehold',
      possession_status: 'ready_to_move',
      developer_name: 'Prestige Group',
      project_name: 'Faridabad Heights',
      ai_score: 9.1,
      featured: true,
      premium_listing: true,
      virtual_tour_url: 'https://example.com/vt/faridabad',
      three_d_tour_url: 'https://example.com/3d/faridabad',
      gift_pack: {
        inclusions: [
          { name: 'Home Theater System', value: 250000, description: '5.1 surround sound system with 55" LED TV' },
          { name: 'Smart Home Automation', value: 150000, description: 'Complete smart home setup with security cameras' },
          { name: 'Modular Kitchen', value: 300000, description: 'Fully equipped modular kitchen with appliances' },
          { name: 'Air Conditioning', value: 200000, description: 'Central AC system for entire villa' }
        ],
        images: ['https://images.unsplash.com/photo-1556909114-4c36e03f6bfe?w=400&q=80'],
        terms: 'Gift pack inclusions are subject to availability and terms & conditions apply.'
      },
      highlight_types: ['Gift Pack Included', 'Ready to Move', 'Premium Listing'],
      price_drop_amount: null,
      is_new_launch: false,
      units_left: null,
      images: [{
        id: '1',
        property_id: 'home-demo-1',
        image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
        alt_text: 'Luxury villa exterior',
        is_primary: true,
        sort_order: 0,
        image_type: 'exterior'
      }],
      predictions: [{
        id: '1',
        property_id: 'home-demo-1',
        prediction_type: 'roi_analysis',
        predicted_value: 12.5,
        confidence_score: 88,
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        factors: { location_growth: 25, market_demand: 30, infrastructure: 35 }
      }, {
        id: '2',
        property_id: 'home-demo-1',
        prediction_type: 'investment_score',
        predicted_value: 85,
        confidence_score: 92,
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        factors: { financial_health: 20, market_timing: 25, risk_assessment: 40 }
      }]
    },
    {
      id: 'home-demo-2',
      title: 'Luxury Apartment in Vrindavan',
      description: 'Modern apartment near ISKCON temple with spiritual ambiance',
      property_type: 'residential',
      listing_type: 'sale',
      sub_type: 'Apartment',
      city: 'Vrindavan',
      state: 'Uttar Pradesh',
      address: 'Near ISKCON, Vrindavan',
      pincode: '281121',
      latitude: 27.5816,
      longitude: 77.7006,
      price: 850000,
      rent_amount: null,
      rent_period: null,
      price_unit: 'INR',
      area: 1500,
      area_unit: 'sqft',
      bedrooms: 3,
      bathrooms: 2,
      parking_spaces: 1,
      floor_number: 5,
      total_floors: 12,
      year_built: 2021,
      furnishing: 'fully_furnished',
      amenities: ['Temple View', 'Meditation Garden', 'Security', 'Power Backup'],
      features: ['East Facing', 'Modular Kitchen', 'Air Conditioning', 'WiFi'],
      rera_registered: true,
      rera_number: 'UP/23456/2021',
      ownership_type: 'freehold',
      possession_status: 'ready_to_move',
      developer_name: 'Divine Properties',
      project_name: 'Vrindavan Residency',
      ai_score: 8.7,
      featured: false,
      premium_listing: false,
      virtual_tour_url: 'https://example.com/vt/vrindavan',
      drone_footage_url: 'https://example.com/drone/vrindavan',
      highlight_types: ['Ready to Move', 'Religious Significance'],
      price_drop_amount: 150000,
      is_new_launch: false,
      units_left: 8,
      images: [{
        id: '2',
        property_id: 'home-demo-2',
        image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
        alt_text: 'Luxury apartment',
        is_primary: true,
        sort_order: 0,
        image_type: 'exterior'
      }],
      predictions: [{
        id: '3',
        property_id: 'home-demo-2',
        prediction_type: 'roi_analysis',
        predicted_value: 18.2,
        confidence_score: 91,
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        factors: { location_growth: 35, market_demand: 25, infrastructure: 20 }
      }, {
        id: '4',
        property_id: 'home-demo-2',
        prediction_type: 'investment_score',
        predicted_value: 78,
        confidence_score: 85,
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        factors: { financial_health: 25, market_timing: 20, risk_assessment: 35 }
      }]
    },
    {
      id: 'home-demo-3',
      title: 'Commercial Space in Dholera',
      description: 'Prime commercial office complex in the upcoming smart city',
      property_type: 'commercial',
      listing_type: 'sale',
      sub_type: 'Office Complex',
      city: 'Dholera',
      state: 'Gujarat',
      address: 'Airport Zone, Dholera',
      pincode: '382465',
      latitude: 22.2442,
      longitude: 72.1994,
      price: 150000000,
      rent_amount: null,
      rent_period: null,
      price_unit: 'INR',
      area: 50000,
      area_unit: 'sqft',
      bedrooms: null,
      bathrooms: 8,
      parking_spaces: 20,
      floor_number: null,
      total_floors: 5,
      year_built: 2023,
      furnishing: 'bare_shell',
      amenities: ['High-speed Internet', 'Conference Rooms', 'Security', 'Power Backup', 'Lift', 'Parking'],
      features: ['Airport Proximity', 'Central AC', 'False Ceiling', 'Modular Design'],
      rera_registered: true,
      rera_number: 'GJ/34567/2023',
      ownership_type: 'freehold',
      possession_status: 'under_construction',
      developer_name: 'Dholera Infrastructure',
      project_name: 'Smart City Centre',
      ai_score: 9.5,
      featured: false,
      premium_listing: true,
      virtual_tour_url: 'https://example.com/vt/dholera',
      three_d_tour_url: 'https://example.com/3d/dholera',
      time_lapse_url: 'https://example.com/timelapse/dholera',
      highlight_types: ['New Launch', 'Premium Listing', 'Under Construction'],
      price_drop_amount: null,
      is_new_launch: true,
      units_left: 15,
      images: [{
        id: '3',
        property_id: 'home-demo-3',
        image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        alt_text: 'Commercial office complex',
        is_primary: true,
        sort_order: 0,
        image_type: 'exterior'
      }],
      predictions: [{
        id: '5',
        property_id: 'home-demo-3',
        prediction_type: 'roi_analysis',
        predicted_value: 25.8,
        confidence_score: 94,
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        factors: { location_growth: 40, market_demand: 35, infrastructure: 50 }
      }, {
        id: '6',
        property_id: 'home-demo-3',
        prediction_type: 'investment_score',
        predicted_value: 92,
        confidence_score: 96,
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        factors: { financial_health: 30, market_timing: 40, risk_assessment: 50 }
      }]
    },
    {
      id: 'home-demo-4',
      title: 'Temple Villa in Ayodhya',
      description: 'Sacred villa in the spiritual capital with temple views',
      property_type: 'residential',
      listing_type: 'sale',
      sub_type: 'Villa',
      city: 'Ayodhya',
      state: 'Uttar Pradesh',
      address: 'Ram Janmabhoomi Area, Ayodhya',
      pincode: '224123',
      latitude: 26.7922,
      longitude: 82.1998,
      price: 12000000,
      rent_amount: null,
      rent_period: null,
      price_unit: 'INR',
      area: 8000,
      area_unit: 'sqft',
      bedrooms: 6,
      bathrooms: 8,
      parking_spaces: 4,
      floor_number: null,
      total_floors: 2,
      year_built: 2020,
      furnishing: 'fully_furnished',
      amenities: ['Temple View', 'Meditation Rooms', 'Garden', 'Security', 'Power Backup'],
      features: ['Sacred Architecture', 'Prayer Rooms', 'Air Conditioning', 'WiFi'],
      rera_registered: true,
      rera_number: 'UP/45678/2020',
      ownership_type: 'freehold',
      possession_status: 'ready_to_move',
      developer_name: 'Sacred Homes',
      project_name: 'Ram Nagar',
      ai_score: 9.3,
      featured: true,
      premium_listing: false,
      virtual_tour_url: 'https://example.com/vt/ayodhya',
      drone_footage_url: 'https://example.com/drone/ayodhya',
      highlight_types: ['Last Few Units', 'Ready to Move', 'Religious Significance'],
      price_drop_amount: 500000,
      is_new_launch: false,
      units_left: 3,
      images: [{
        id: '4',
        property_id: 'home-demo-4',
        image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        alt_text: 'Temple villa',
        is_primary: true,
        sort_order: 0,
        image_type: 'exterior'
      }],
      predictions: [{
        id: '7',
        property_id: 'home-demo-4',
        prediction_type: 'roi_analysis',
        predicted_value: 30.5,
        confidence_score: 96,
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        factors: { location_growth: 50, market_demand: 40, infrastructure: 45 }
      }, {
        id: '8',
        property_id: 'home-demo-4',
        prediction_type: 'investment_score',
        predicted_value: 88,
        confidence_score: 93,
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        factors: { financial_health: 35, market_timing: 30, risk_assessment: 45 }
      }]
    },
    {
      id: 'home-demo-5',
      title: 'IT Park in Hyderabad',
      description: 'Modern IT park complex in Hi-Tech City with excellent infrastructure',
      property_type: 'commercial',
      listing_type: 'sale',
      sub_type: 'IT Park',
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Hi-Tech City, Hyderabad',
      pincode: '500081',
      latitude: 17.4435,
      longitude: 78.3772,
      price: 250000000,
      rent_amount: null,
      rent_period: null,
      price_unit: 'INR',
      area: 25000,
      area_unit: 'sqft',
      bedrooms: null,
      bathrooms: 12,
      parking_spaces: 50,
      floor_number: null,
      total_floors: 8,
      year_built: 2022,
      furnishing: 'bare_shell',
      amenities: ['High-speed Internet', 'Conference Rooms', 'Cafeteria', 'Security', 'Power Backup', 'Lift', 'Parking'],
      features: ['Tech Infrastructure', 'Central AC', 'False Ceiling', 'Modular Design'],
      rera_registered: true,
      rera_number: 'TS/56789/2022',
      ownership_type: 'freehold',
      possession_status: 'ready_to_move',
      developer_name: 'Tech Parks India',
      project_name: 'Cyber City',
      ai_score: 9.7,
      featured: false,
      premium_listing: true,
      virtual_tour_url: 'https://example.com/vt/hyderabad',
      three_d_tour_url: 'https://example.com/3d/hyderabad',
      drone_footage_url: 'https://example.com/drone/hyderabad',
      time_lapse_url: 'https://example.com/timelapse/hyderabad',
      highlight_types: ['Exclusive Deal', 'Premium Listing', 'Ready to Move'],
      price_drop_amount: 10000000,
      is_new_launch: false,
      units_left: null,
      images: [{
        id: '5',
        property_id: 'home-demo-5',
        image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
        alt_text: 'IT park complex',
        is_primary: true,
        sort_order: 0,
        image_type: 'exterior'
      }],
      predictions: [{
        id: '9',
        property_id: 'home-demo-5',
        prediction_type: 'roi_analysis',
        predicted_value: 20.3,
        confidence_score: 92,
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        factors: { location_growth: 30, market_demand: 45, infrastructure: 55 }
      }, {
        id: '10',
        property_id: 'home-demo-5',
        prediction_type: 'investment_score',
        predicted_value: 94,
        confidence_score: 98,
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        factors: { financial_health: 40, market_timing: 35, risk_assessment: 55 }
      }]
    },
    {
      id: 'home-demo-6',
      title: 'Beachfront Resort in Goa',
      description: 'Luxury beachfront resort with panoramic ocean views',
      property_type: 'commercial',
      listing_type: 'sale',
      sub_type: 'Resort',
      city: 'Panaji',
      state: 'Goa',
      address: 'Calangute Beach, North Goa',
      pincode: '403516',
      latitude: 15.5405,
      longitude: 73.7551,
      price: 180000000,
      rent_amount: null,
      rent_period: null,
      price_unit: 'INR',
      area: 15000,
      area_unit: 'sqft',
      bedrooms: null,
      bathrooms: 20,
      parking_spaces: 15,
      floor_number: null,
      total_floors: 3,
      year_built: 2021,
      furnishing: 'fully_furnished',
      amenities: ['Private Beach', 'Swimming Pool', 'Spa', 'Restaurant', 'Security', 'Power Backup', 'Parking'],
      features: ['Ocean View', 'Balcony Access', 'Air Conditioning', 'WiFi'],
      rera_registered: true,
      rera_number: 'GA/67890/2021',
      ownership_type: 'freehold',
      possession_status: 'ready_to_move',
      developer_name: 'Goa Resorts Ltd',
      project_name: 'Calangute Paradise',
      ai_score: 8.9,
      featured: false,
      premium_listing: true,
      virtual_tour_url: 'https://example.com/vt/goa',
      three_d_tour_url: 'https://example.com/3d/goa',
      drone_footage_url: 'https://example.com/drone/goa',
      time_lapse_url: 'https://example.com/timelapse/goa',
      highlight_types: ['Exclusive Deal', 'Premium Listing', 'Ready to Move'],
      price_drop_amount: 5000000,
      is_new_launch: false,
      units_left: null,
      images: [{
        id: '6',
        property_id: 'home-demo-6',
        image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
        alt_text: 'Beachfront resort',
        is_primary: true,
        sort_order: 0,
        image_type: 'exterior'
      }],
      predictions: [{
        id: '11',
        property_id: 'home-demo-6',
        prediction_type: 'roi_analysis',
        predicted_value: 22.1,
        confidence_score: 89,
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        factors: { location_growth: 35, market_demand: 40, infrastructure: 30 }
      }, {
        id: '12',
        property_id: 'home-demo-6',
        prediction_type: 'investment_score',
        predicted_value: 86,
        confidence_score: 91,
        valid_until: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        factors: { financial_health: 30, market_timing: 25, risk_assessment: 40 }
      }]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Schema Markup */}
      <SchemaMarkup type="organization" data={{}} />
      <SchemaMarkup type="website" data={{}} />
      <SchemaMarkup type="real-estate-agent" data={{}} />

      {/* Dynamic Banner */}
      <DynamicBanner />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover India's
              <span className="text-orange-400"> Next Boom Cities</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Premium real estate opportunities in Faridabad, Dholera, Vrindavan, and more.
              Powered by AI insights for smart investments.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4 bg-white/10 backdrop-blur-md rounded-lg p-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search properties, locations, or cities..."
                    className="pl-10 bg-white text-gray-900 border-0"
                  />
                </div>
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Search Properties
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                Residential
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                Commercial
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                Plots
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                Religious
              </Badge>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Properties Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">25,000+</div>
              <div className="text-gray-600">Happy Investors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">₹500Cr+</div>
              <div className="text-gray-600">Investment Facilitated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Properties</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
              Handpicked premium properties with AR/3D viewing and high growth potential
            </p>
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>AR Tours</span>
              </div>
              <div className="flex items-center gap-1">
                <RotateCcw className="h-4 w-4" />
                <span>3D Models</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>Premium Experience</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

         <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/properties">View All Properties</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Boom Cities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover investment opportunities in India's fastest-growing cities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/locations/faridabad" className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-all group-hover:scale-105">
                <div className="h-32 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"
                    alt="Faridabad City Skyline"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold">Faridabad</h3>
                    <p className="text-sm">Delhi NCR</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/locations/dholera" className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-all group-hover:scale-105">
                <div className="h-32 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                    alt="Dholera Smart City"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold">Dholera</h3>
                    <p className="text-sm">Smart City</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/locations/vrindavan" className="group">
               <Card className="overflow-hidden hover:shadow-lg transition-all group-hover:scale-105">
                 <div className="h-32 relative">
                   <Image
                     src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"
                     alt="Krishna Temple in Vrindavan"
                     fill
                     className="object-cover"
                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                   />
                   <div className="absolute inset-0 bg-black/40"></div>
                   <div className="absolute bottom-4 left-4 text-white">
                     <h3 className="font-bold">Vrindavan</h3>
                     <p className="text-sm">Religious Hub</p>
                   </div>
                 </div>
               </Card>
             </Link>

            <Link href="/locations/ayodhya" className="group">
               <Card className="overflow-hidden hover:shadow-lg transition-all group-hover:scale-105">
                 <div className="h-32 relative">
                   <Image
                     src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                     alt="Lord Rama Temple in Ayodhya"
                     fill
                     className="object-cover"
                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                   />
                   <div className="absolute inset-0 bg-black/40"></div>
                   <div className="absolute bottom-4 left-4 text-white">
                     <h3 className="font-bold">Ayodhya</h3>
                     <p className="text-sm">Ram Mandir</p>
                   </div>
                 </div>
               </Card>
             </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Invest in India's Future?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of smart investors who are building wealth through strategic real estate investments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              Get Started Today
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-orange-500 hover:text-white bg-orange-500/10">
              Learn More
            </Button>
          </div>
        </div>
      </section>

          {/* AR Modal */}
          <Dialog open={arModalOpen} onOpenChange={setArModalOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>AR Property Experience</DialogTitle>
              </DialogHeader>
              {currentProperty && (
                <PropertyARViewer
                  propertyTitle={currentProperty.title}
                  propertyId={currentProperty.id}
                  onClose={() => setArModalOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Virtual Tour Modal */}
          <Dialog open={virtualTourModalOpen} onOpenChange={setVirtualTourModalOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Virtual Tour Experience</DialogTitle>
              </DialogHeader>
              {currentProperty && currentProperty.images && (
                <VirtualTourViewer
                  propertyTitle={currentProperty.title}
                  images={currentProperty.images}
                  onClose={() => setVirtualTourModalOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* AI Chatbot */}
          <AIChatbot />
    </div>
  );
}
