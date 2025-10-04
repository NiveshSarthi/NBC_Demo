import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MapPin, TrendingUp, X } from "lucide-react";

export default function SavedPropertiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Saved Properties</h1>
            <p className="text-gray-600">Your favorite properties for future reference</p>
          </div>
          <Select defaultValue="newest">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Recently Saved</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="roi">Highest ROI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-500">
                      <Heart className="h-3 w-3 mr-1" />
                      Saved
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">Saved Property {i + 1}</h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  Prime Location, City Name
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>2,500 sq ft</span>
                  <span>3 BHK</span>
                  <span className="text-green-600 font-medium">ROI: 12%</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-green-600">₹2.5Cr</span>
                  <div className="text-right text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    +8.5%
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" asChild>
                    <Link href={`/properties/${i + 1}`}>View Details</Link>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {false && (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved properties yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring properties and save your favorites for later.
            </p>
            <Button asChild>
              <Link href="/properties">Browse Properties</Link>
            </Button>
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Properties
          </Button>
        </div>
      </div>
    </div>
  );
}