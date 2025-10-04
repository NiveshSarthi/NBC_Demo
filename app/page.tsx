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

  return (
    <div className="min-h-screen">
      {/* Schema Markup */}
      <SchemaMarkup type="organization" data={{}} />
      <SchemaMarkup type="website" data={{}} />
      <SchemaMarkup type="real-estate-agent" data={{}} />

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
           {/* Property Card 1 - AR Featured */}
           <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-blue-200">
             <div className="h-48 relative">
               <Image
                 src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"
                 alt="Luxury Villa in Faridabad"
                 fill
                 className="object-cover"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
               <div className="absolute top-4 left-4 flex gap-2">
                 <Badge className="bg-orange-500">Premium</Badge>
                 <Badge className="bg-purple-500 flex items-center gap-1">
                   <Eye className="h-3 w-3" />
                   AR View
                 </Badge>
               </div>
               <div className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded">
                 <div className="text-lg font-bold">₹2.5Cr</div>
                 <div className="text-sm">3BHK Villa</div>
               </div>
             </div>
             <CardContent className="p-6">
               <h3 className="font-semibold text-lg mb-2">Luxury Villa in Faridabad</h3>
               <div className="flex items-center text-gray-600 mb-3">
                 <MapPin className="h-4 w-4 mr-1" />
                 Sector 89, Faridabad
               </div>
               <div className="flex justify-between text-sm text-gray-600 mb-4">
                 <span>2,500 sq ft</span>
                 <span>ROI: 12%</span>
               </div>
               <div className="flex gap-2">
                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1"
                   onClick={() => handleOpenARModal({ title: "Luxury Villa in Faridabad", id: "faridabad-villa" })}
                 >
                   <Eye className="h-4 w-4 mr-1" />
                   AR Tour
                 </Button>
                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1"
                   onClick={() => handleOpenVirtualTourModal({
                     title: "Luxury Villa in Faridabad",
                     id: "faridabad-villa",
                     images: faridabadImages
                   })}
                 >
                   <RotateCcw className="h-4 w-4 mr-1" />
                   3D View
                 </Button>
               </div>
             </CardContent>
           </Card>

           {/* Property Card 2 - 3D Featured */}
           <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-green-200">
          <div className="h-48 relative">
            <Image
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"
              alt="Luxury Apartment in Vrindavan"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
               <div className="absolute top-4 left-4 flex gap-2">
                 <Badge className="bg-green-500">Residential</Badge>
                 <Badge className="bg-indigo-500 flex items-center gap-1">
                   <RotateCcw className="h-3 w-3" />
                   3D Model
                 </Badge>
               </div>
               <div className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded">
                 <div className="text-lg font-bold">₹85L</div>
                 <div className="text-sm">3BHK Apartment</div>
               </div>
             </div>
             <CardContent className="p-6">
               <h3 className="font-semibold text-lg mb-2">Luxury Apartment in Vrindavan</h3>
               <div className="flex items-center text-gray-600 mb-3">
                 <MapPin className="h-4 w-4 mr-1" />
                 Near ISKCON, Vrindavan
               </div>
               <div className="flex justify-between text-sm text-gray-600 mb-4">
                 <span>1,500 sq ft</span>
                 <span>ROI: 18%</span>
               </div>
               <div className="flex gap-2">
                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1"
                   onClick={() => handleOpenARModal({ title: "Luxury Apartment in Vrindavan", id: "vrindavan-apartment" })}
                 >
                   <Eye className="h-4 w-4 mr-1" />
                   AR View
                 </Button>
                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1"
                   onClick={() => handleOpenVirtualTourModal({
                     title: "Luxury Apartment in Vrindavan",
                     id: "vrindavan-apartment",
                     images: vrindavanImages
                   })}
                 >
                   <RotateCcw className="h-4 w-4 mr-1" />
                   3D Model
                 </Button>
               </div>
             </CardContent>
           </Card>

           {/* Property Card 3 - AR/3D Featured */}
           <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-orange-200">
             <div className="h-48 relative">
               <Image
                 src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                 alt="Commercial Space in Dholera"
                 fill
                 className="object-cover"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
               <div className="absolute top-4 left-4 flex gap-2">
                 <Badge className="bg-blue-500">Commercial</Badge>
                 <Badge className="bg-pink-500 flex items-center gap-1">
                   <Eye className="h-3 w-3" />
                   AR/3D
                 </Badge>
               </div>
               <div className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded">
                 <div className="text-lg font-bold">₹15Cr</div>
                 <div className="text-sm">Office Complex</div>
               </div>
             </div>
             <CardContent className="p-6">
               <h3 className="font-semibold text-lg mb-2">Commercial Space in Dholera</h3>
               <div className="flex items-center text-gray-600 mb-3">
                 <MapPin className="h-4 w-4 mr-1" />
                 Airport Zone, Dholera
               </div>
               <div className="flex justify-between text-sm text-gray-600 mb-4">
                 <span>50,000 sq ft</span>
                 <span>ROI: 25%</span>
               </div>
               <div className="flex gap-2">
                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1"
                   onClick={() => handleOpenARModal({ title: "Commercial Space in Dholera", id: "dholera-commercial" })}
                 >
                   <Eye className="h-4 w-4 mr-1" />
                   AR Walkthrough
                 </Button>
                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1"
                   onClick={() => handleOpenVirtualTourModal({
                     title: "Commercial Space in Dholera",
                     id: "dholera-commercial",
                     images: dholeraImages
                   })}
                 >
                   <RotateCcw className="h-4 w-4 mr-1" />
                   360° View
                 </Button>
               </div>
             </CardContent>
           </Card>

           {/* Property Card 4 - Religious Featured */}
           <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-red-200">
             <div className="h-48 relative">
               <Image
                 src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                 alt="Luxury Villa in Ayodhya"
                 fill
                 className="object-cover"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
               <div className="absolute top-4 left-4 flex gap-2">
                 <Badge className="bg-red-500">Sacred</Badge>
                 <Badge className="bg-teal-500 flex items-center gap-1">
                   <Eye className="h-3 w-3" />
                   AR/3D
                 </Badge>
               </div>
               <div className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded">
                 <div className="text-lg font-bold">₹12Cr</div>
                 <div className="text-sm">Temple Villa</div>
               </div>
             </div>
             <CardContent className="p-6">
               <h3 className="font-semibold text-lg mb-2">Temple Villa in Ayodhya</h3>
               <div className="flex items-center text-gray-600 mb-3">
                 <MapPin className="h-4 w-4 mr-1" />
                 Ram Janmabhoomi Area, Ayodhya
               </div>
               <div className="flex justify-between text-sm text-gray-600 mb-4">
                 <span>8,000 sq ft</span>
                 <span>ROI: 30%</span>
               </div>
               <div className="flex gap-2">
                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1"
                   onClick={() => handleOpenARModal({ title: "Temple Villa in Ayodhya", id: "ayodhya-temple-villa" })}
                 >
                   <Eye className="h-4 w-4 mr-1" />
                   AR Experience
                 </Button>
                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1"
                   onClick={() => handleOpenVirtualTourModal({
                     title: "Temple Villa in Ayodhya",
                     id: "ayodhya-temple-villa",
                     images: ayodhyaImages
                   })}
                 >
                   <RotateCcw className="h-4 w-4 mr-1" />
                   Virtual Tour
                 </Button>
               </div>
             </CardContent>
           </Card>

           {/* Property Card 5 - Hyderabad Featured */}
           <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-purple-200">
             <div className="h-48 relative">
               <Image
                 src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                 alt="IT Park in Hyderabad"
                 fill
                 className="object-cover"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
               <div className="absolute top-4 left-4 flex gap-2">
                 <Badge className="bg-purple-500">Tech Hub</Badge>
                 <Badge className="bg-cyan-500 flex items-center gap-1">
                   <Eye className="h-3 w-3" />
                   AR/3D
                 </Badge>
               </div>
               <div className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded">
                 <div className="text-lg font-bold">₹25Cr</div>
                 <div className="text-sm">IT Park Complex</div>
               </div>
             </div>
             <CardContent className="p-6">
               <h3 className="font-semibold text-lg mb-2">IT Park in Hyderabad</h3>
               <div className="flex items-center text-gray-600 mb-3">
                 <MapPin className="h-4 w-4 mr-1" />
                 Hi-Tech City, Hyderabad
               </div>
               <div className="flex justify-between text-sm text-gray-600 mb-4">
                 <span>25,000 sq ft</span>
                 <span>ROI: 20%</span>
               </div>
               <div className="flex gap-2">
                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1"
                   onClick={() => handleOpenARModal({ title: "IT Park in Hyderabad", id: "hyderabad-it-park" })}
                 >
                   <Eye className="h-4 w-4 mr-1" />
                   AR Tour
                 </Button>
                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1"
                   onClick={() => handleOpenVirtualTourModal({
                     title: "IT Park in Hyderabad",
                     id: "hyderabad-it-park",
                     images: hyderabadImages
                   })}
                 >
                   <RotateCcw className="h-4 w-4 mr-1" />
                   3D Model
                 </Button>
               </div>
             </CardContent>
           </Card>

           {/* Property Card 6 - Goa Featured */}
           <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-teal-200">
             <div className="h-48 relative">
               <Image
                 src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80"
                 alt="Beachfront Resort in Goa"
                 fill
                 className="object-cover"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
               <div className="absolute top-4 left-4 flex gap-2">
                 <Badge className="bg-teal-500">Luxury</Badge>
                 <Badge className="bg-pink-500 flex items-center gap-1">
                   <Eye className="h-3 w-3" />
                   AR/3D
                 </Badge>
               </div>
               <div className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded">
                 <div className="text-lg font-bold">₹18Cr</div>
                 <div className="text-sm">Beach Resort</div>
               </div>
             </div>
             <CardContent className="p-6">
               <h3 className="font-semibold text-lg mb-2">Beachfront Resort in Goa</h3>
               <div className="flex items-center text-gray-600 mb-3">
                 <MapPin className="h-4 w-4 mr-1" />
                 Calangute Beach, Goa
               </div>
               <div className="flex justify-between text-sm text-gray-600 mb-4">
                 <span>15,000 sq ft</span>
                 <span>ROI: 22%</span>
               </div>
               <div className="flex gap-2">
                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1"
                   onClick={() => handleOpenARModal({ title: "Beachfront Resort in Goa", id: "goa-beach-resort" })}
                 >
                   <Eye className="h-4 w-4 mr-1" />
                   AR Experience
                 </Button>
                 <Button
                   size="sm"
                   variant="outline"
                   className="flex-1"
                   onClick={() => handleOpenVirtualTourModal({
                     title: "Beachfront Resort in Goa",
                     id: "goa-beach-resort",
                     images: goaImages
                   })}
                 >
                   <RotateCcw className="h-4 w-4 mr-1" />
                   Virtual Tour
                 </Button>
               </div>
             </CardContent>
           </Card>
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
    </div>
  );
}
