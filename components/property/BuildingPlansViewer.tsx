"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle,
  Eye,
  BarChart3,
  Compass,
  Maximize,
  Minimize
} from "lucide-react";

// Simple zoom implementation
const ZoomableImage = ({ src, alt }: { src: string; alt: string }) => {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale(Math.min(scale + 0.5, 3));
  const handleZoomOut = () => setScale(Math.max(scale - 0.5, 0.5));
  const handleReset = () => setScale(1);

  return (
    <div className="relative">
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-600 self-center">{Math.round(scale * 100)}%</span>
      </div>
      <div className="overflow-auto border rounded-lg" style={{ height: '400px' }}>
        <img
          src={src}
          alt={alt}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease'
          }}
          className="max-w-none"
        />
      </div>
    </div>
  );
};

interface BuildingPlansViewerProps {
  floorPlanUrl?: string;
  threeDTourUrl?: string;
  vastuCompliant?: boolean;
  orientation?: string;
  carpetArea?: number;
  builtUpArea?: number;
  areaUnit?: string;
  propertyTitle: string;
}

export function BuildingPlansViewer({
  floorPlanUrl,
  threeDTourUrl,
  vastuCompliant = false,
  orientation,
  carpetArea,
  builtUpArea,
  areaUnit = "sqft",
  propertyTitle
}: BuildingPlansViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Mock comparison data - in real implementation, this would come from API
  const comparisonUnits = [
    { id: 1, name: "2BHK - 850 sqft", price: 8500000, area: 850 },
    { id: 2, name: "3BHK - 1200 sqft", price: 12000000, area: 1200 },
    { id: 3, name: "4BHK - 1600 sqft", price: 16000000, area: 1600 }
  ];

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateAreaBreakdown = () => {
    if (!carpetArea || !builtUpArea) return null;
    const commonArea = builtUpArea - carpetArea;
    const carpetPercentage = (carpetArea / builtUpArea) * 100;
    const commonPercentage = (commonArea / builtUpArea) * 100;
    return { carpetPercentage, commonPercentage, commonArea };
  };

  const areaBreakdown = calculateAreaBreakdown();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Floor Plans & Layouts</h2>
          <p className="text-gray-600">Explore detailed floor plans, 3D walkthroughs, and area details for {propertyTitle}</p>
        </div>
        <div className="flex gap-2">
          {vastuCompliant && (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Vastu Compliant
            </Badge>
          )}
          {orientation && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Compass className="h-3 w-3" />
              {orientation}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="floorplan" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="floorplan">Floor Plan</TabsTrigger>
          <TabsTrigger value="3dtour">3D Tour</TabsTrigger>
          <TabsTrigger value="areas">Area Details</TabsTrigger>
        </TabsList>

        {/* Floor Plan Tab */}
        <TabsContent value="floorplan" className="space-y-4">
          {floorPlanUrl ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Interactive Floor Plan
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(floorPlanUrl, `${propertyTitle}-floor-plan.jpg`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
                  {isFullscreen && (
                    <Button
                      className="absolute top-2 right-2 z-10"
                      onClick={() => setIsFullscreen(false)}
                    >
                      <Minimize className="h-4 w-4" />
                    </Button>
                  )}
                  <div className={isFullscreen ? 'h-full' : 'h-96'}>
                    <ZoomableImage
                      src={floorPlanUrl}
                      alt={`${propertyTitle} floor plan`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Floor plan not available for this property</p>
              </CardContent>
            </Card>
          )}

          {/* Unit Comparison */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Unit Comparison
                </CardTitle>
                <Dialog open={showComparison} onOpenChange={setShowComparison}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Compare Units
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Unit Comparison - {propertyTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {comparisonUnits.map((unit) => (
                        <Card key={unit.id}>
                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-2">{unit.name}</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Area:</span>
                                <span>{unit.area} {areaUnit}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Price:</span>
                                <span>₹{(unit.price / 100000).toFixed(1)}L</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Rate:</span>
                                <span>₹{Math.round(unit.price / unit.area)}/{areaUnit}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 mb-4">
                Compare different unit types available in this property
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {comparisonUnits.slice(0, 3).map((unit) => (
                  <div key={unit.id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{unit.name}</h4>
                    <div className="text-sm space-y-1">
                      <div>Area: {unit.area} {areaUnit}</div>
                      <div>Price: ₹{(unit.price / 100000).toFixed(1)}L</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3D Tour Tab */}
        <TabsContent value="3dtour" className="space-y-4">
          {threeDTourUrl ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  3D Virtual Tour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full">
                  <iframe
                    src={threeDTourUrl}
                    className="w-full h-full rounded-lg border"
                    allowFullScreen
                    title="3D Virtual Tour"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">3D virtual tour not available for this property</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Area Details Tab */}
        <TabsContent value="areas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Area Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Area Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {areaBreakdown ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Carpet Area</span>
                        <span>{carpetArea} {areaUnit} ({areaBreakdown.carpetPercentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={areaBreakdown.carpetPercentage} className="h-3" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Common Area</span>
                        <span>{areaBreakdown.commonArea} {areaUnit} ({areaBreakdown.commonPercentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={areaBreakdown.commonPercentage} className="h-3" />
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-semibold">
                        <span>Total Built-up Area</span>
                        <span>{builtUpArea} {areaUnit}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-600">
                    <p>Area breakdown data not available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Orientation & Vastu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5" />
                  Property Orientation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orientation && (
                  <div className="flex items-center gap-3">
                    <Compass className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="font-medium">Facing Direction</div>
                      <div className="text-sm text-gray-600">{orientation}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {vastuCompliant ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="font-medium text-green-600">Vastu Compliant</div>
                        <div className="text-sm text-gray-600">Property follows Vastu principles</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Compass className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium">Vastu Status</div>
                        <div className="text-sm text-gray-600">Not specified</div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}