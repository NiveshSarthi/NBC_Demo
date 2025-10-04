"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { PhoneIcon, CalendarIcon, HistoryIcon, BellOffIcon } from 'lucide-react';

interface SmartCallButtonProps {
  propertyId: number;
  agentId: number;
  userId?: number;
}

export default function SmartCallButton({ propertyId, agentId, userId }: SmartCallButtonProps) {
  const [isDoNotDisturb, setIsDoNotDisturb] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCallNow = () => {
    // Simulated masked call initiation
    alert('Initiating masked call... (simulated)');
    console.log('Masked call initiated for property:', propertyId, 'agent:', agentId);
  };

  const handleScheduleCallback = (date: string, time: string) => {
    // API call to schedule
    console.log('Scheduling callback for:', date, time, 'property:', propertyId);
    setIsModalOpen(false);
  };

  // Mock call history data
  const callHistory = [
    { id: 1, date: '2024-10-01', time: '10:00 AM', status: 'completed', duration: '15 min' },
    { id: 2, date: '2024-09-28', time: '2:00 PM', status: 'missed', duration: null },
  ];

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PhoneIcon className="w-4 h-4 mr-2" />
            Call Options
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Options</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="call" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="call">Call Now</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="call" className="space-y-4">
              <div className="text-center">
                <Button onClick={handleCallNow} className="w-full">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  Call Now (Masked)
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect with the agent securely through our masked calling system.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="schedule" className="space-y-4">
              <ScheduleCallbackForm onSchedule={handleScheduleCallback} />
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <CallHistory calls={callHistory} />
            </TabsContent>
          </Tabs>
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="do-not-disturb"
              checked={isDoNotDisturb}
              onCheckedChange={(checked) => setIsDoNotDisturb(checked === true)}
            />
            <label htmlFor="do-not-disturb" className="text-sm">
              <BellOffIcon className="w-4 h-4 inline mr-1" />
              Do Not Disturb
            </label>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ScheduleCallbackForm({ onSchedule }: { onSchedule: (date: string, time: string) => void }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      onSchedule(selectedDate, selectedTime);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Select Time</label>
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        >
          <option value="">Choose a time</option>
          <option value="09:00">9:00 AM</option>
          <option value="10:00">10:00 AM</option>
          <option value="11:00">11:00 AM</option>
          <option value="14:00">2:00 PM</option>
          <option value="15:00">3:00 PM</option>
          <option value="16:00">4:00 PM</option>
        </select>
      </div>
      <Button type="submit" className="w-full">
        <CalendarIcon className="w-4 h-4 mr-2" />
        Schedule Callback
      </Button>
    </form>
  );
}

function CallHistory({ calls }: { calls: any[] }) {
  return (
    <div className="space-y-2">
      {calls.length === 0 ? (
        <p className="text-muted-foreground">No call history available.</p>
      ) : (
        calls.map((call) => (
          <div key={call.id} className="flex justify-between items-center p-2 border rounded">
            <div>
              <p className="text-sm font-medium">{call.date} at {call.time}</p>
              <p className="text-xs text-muted-foreground">Status: {call.status}</p>
            </div>
            {call.duration && (
              <span className="text-sm">{call.duration}</span>
            )}
          </div>
        ))
      )}
    </div>
  );
}