import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp, Building, BarChart3 } from "lucide-react";

export default function MapsPage() {
  const mapSections = [
    {
      title: "Growth Heatmap",
      description: "Visualize property price trends and growth areas across cities",
      href: "/maps/growth-heatmap",
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      title: "Master Plans",
      description: "Explore detailed city master plans and development zones",
      href: "/maps/master-plans",
      icon: Building,
      color: "bg-blue-500",
    },
    {
      title: "Price Trends",
      description: "Interactive maps showing property price variations",
      href: "/maps/price-trends",
      icon: BarChart3,
      color: "bg-orange-500",
    },
    {
      title: "Religious Tourism",
      description: "Maps highlighting religious sites and tourism potential",
      href: "/maps/religious-tourism",
      icon: MapPin,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Property Maps & Analytics</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover insights through interactive maps and data visualizations.
            Explore growth patterns, master plans, and investment opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {mapSections.map((section) => (
            <Card key={section.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center mb-4`}>
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{section.title}</CardTitle>
                <CardDescription className="text-base">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={section.href}>
                    Explore {section.title}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Custom Analysis?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get personalized property market analysis and investment recommendations
            based on your specific requirements and budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Request Analysis
            </Button>
            <Button size="lg" variant="outline">
              View Sample Reports
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}