import * as React from "react";
import { CheckCircle, XCircle, Wifi, Zap, ShoppingCart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BroadbandISP {
  name: string;
  speeds: string[];
  fiber_available: boolean;
}

interface Utilities {
  "24x7_water_supply": boolean;
  power_backup_options: string[];
  gas_pipeline: boolean;
  sewage_system: boolean;
  cable_tv: boolean;
}

interface DailyNeeds {
  grocery_stores_distance: number;
  medical_shops_distance: number;
  laundry_services: boolean;
  domestic_help_available: boolean;
  pet_friendly_facilities: boolean;
}

interface EssentialServices {
  broadband: BroadbandISP[];
  utilities: Utilities;
  daily_needs: DailyNeeds;
}

interface EssentialServicesCheckerProps {
  data: EssentialServices | null;
}

export function EssentialServicesChecker({ data }: EssentialServicesCheckerProps) {
  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Essential services data not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Essential Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="broadband" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="broadband" className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Broadband & Telecom
            </TabsTrigger>
            <TabsTrigger value="utilities" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Utilities Availability
            </TabsTrigger>
            <TabsTrigger value="daily-needs" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Daily Needs Proximity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="broadband" className="mt-4">
            <div className="space-y-4">
              {data.broadband.map((isp, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{isp.name}</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {isp.speeds.map((speed, speedIndex) => (
                      <Badge key={speedIndex} variant="secondary">
                        {speed}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Fiber Available:</span>
                    {isp.fiber_available ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        No
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="utilities" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>24x7 Water Supply</span>
                {data.utilities["24x7_water_supply"] ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Power Backup Options</span>
                <div className="flex gap-1">
                  {data.utilities.power_backup_options.map((option, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Gas Pipeline</span>
                {data.utilities.gas_pipeline ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Sewage System</span>
                {data.utilities.sewage_system ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Cable TV</span>
                {data.utilities.cable_tv ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="daily-needs" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Grocery Stores Distance</span>
                <Badge variant="secondary">{data.daily_needs.grocery_stores_distance} km</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Medical Shops Distance</span>
                <Badge variant="secondary">{data.daily_needs.medical_shops_distance} km</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Laundry Services</span>
                {data.daily_needs.laundry_services ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Domestic Help Available</span>
                {data.daily_needs.domestic_help_available ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Pet Friendly Facilities</span>
                {data.daily_needs.pet_friendly_facilities ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}