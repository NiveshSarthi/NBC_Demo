import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ViewingSchedule {
  id: number;
  user_id: number;
  property_id: number;
  scheduled_at: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  property: {
    title: string;
    address?: string;
    city?: string;
  };
}

interface ViewingSchedulerProps {
  propertyId?: number; // Optional - if not provided, shows all user's viewings
}

export function ViewingScheduler({ propertyId }: ViewingSchedulerProps) {
  const [viewings, setViewings] = useState<ViewingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newViewing, setNewViewing] = useState({
    scheduled_at: "",
    notes: ""
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchViewings();
    }
  }, [user, propertyId]);

  const fetchViewings = async () => {
    try {
      setLoading(true);
      const url = propertyId
        ? `/api/v1/properties/${propertyId}/viewings`
        : '/api/v1/user/viewings';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setViewings(data);
      }
    } catch (error) {
      console.error('Error fetching viewings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleViewing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !propertyId) return;

    try {
      const response = await fetch('/api/v1/viewings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newViewing,
          property_id: propertyId,
        }),
      });

      if (response.ok) {
        setNewViewing({ scheduled_at: "", notes: "" });
        setShowScheduleForm(false);
        await fetchViewings();
      }
    } catch (error) {
      console.error('Error scheduling viewing:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Viewing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Please sign in to schedule property viewings
          </p>
          <Button variant="outline">
            Sign In to Schedule
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {propertyId ? 'Schedule Viewing' : 'My Viewings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            {propertyId ? 'Schedule Viewing' : 'My Viewings'}
          </CardTitle>
          {propertyId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScheduleForm(!showScheduleForm)}
            >
              Schedule New Viewing
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {propertyId && showScheduleForm && (
          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6">
              <form onSubmit={handleScheduleViewing} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newViewing.scheduled_at}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewViewing(prev => ({ ...prev, scheduled_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    value={newViewing.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewViewing(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowScheduleForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Schedule Viewing</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {viewings.map((viewing) => (
          <Card key={viewing.id} className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{viewing.property.title}</span>
                    <Badge className={getStatusColor(viewing.status)}>
                      {viewing.status}
                    </Badge>
                  </div>
                  {viewing.property.address && (
                    <p className="text-sm text-gray-600 mb-2">{viewing.property.address}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(viewing.scheduled_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(viewing.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {viewing.notes && (
                    <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                      {viewing.notes}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {viewings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {propertyId
                ? "No viewings scheduled yet. Schedule your first viewing!"
                : "You haven't scheduled any property viewings yet."
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}