"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { InquiryMessaging } from "./InquiryMessaging";

interface AnonymousInquiryFormProps {
  propertyId: number;
}

export function AnonymousInquiryForm({ propertyId }: AnonymousInquiryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiryId, setInquiryId] = useState<number | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Message is required");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/user/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          message: message.trim(),
          inquiryType: 'general',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      const result = await response.json();
      setInquiryId(result.inquiry.id);
      setShowMessaging(false); // First show success, then can start messaging
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setError("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartMessaging = () => {
    setShowMessaging(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setInquiryId(null);
    setShowMessaging(false);
    setMessage("");
    setError("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">I'm Interested</Button>
      </DialogTrigger>
      <DialogContent>
        {showMessaging && inquiryId ? (
          <InquiryMessaging inquiryId={inquiryId} onClose={handleClose} />
        ) : inquiryId ? (
          <>
            <DialogHeader>
              <DialogTitle>Inquiry Submitted Successfully!</DialogTitle>
              <DialogDescription>
                Your anonymous inquiry has been sent to the property owner.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleStartMessaging}>
                Start Messaging
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Express Interest</DialogTitle>
              <DialogDescription>
                Send an anonymous message to the property owner.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="I'm interested in this property..."
                  rows={4}
                  className="w-full px-3 py-2 border border-input bg-transparent rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Inquiry"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}