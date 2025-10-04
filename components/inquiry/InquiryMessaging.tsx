"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InquiryMessagingProps {
  inquiryId: number;
  onClose: () => void;
}

interface Message {
  sender_id: number | null;
  content: string;
  timestamp: string;
  is_from_user: boolean;
}

export function InquiryMessaging({ inquiryId, onClose }: InquiryMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch inquiry messages (placeholder - would need API)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Placeholder - in real implementation, fetch from API
        // const response = await fetch(`/api/v1/inquiry/${inquiryId}`);
        // const data = await response.json();
        // setMessages(data.messages || []);

        // For now, simulate with empty messages
        setMessages([]);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [inquiryId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      sender_id: null, // anonymous
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      is_from_user: true,
    };

    // Optimistically add message
    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // In real implementation, send to API
    // try {
    //   await fetch(`/api/v1/inquiry/${inquiryId}/message`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ content: newMessage }),
    //   });
    // } catch (error) {
    //   // Handle error - remove optimistic message
    //   setMessages(prev => prev.slice(0, -1));
    // }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Loading Messages...</DialogTitle>
        </DialogHeader>
      </DialogContent>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Inquiry Chat</DialogTitle>
        <DialogDescription>
          Chat with the property owner about this inquiry.
        </DialogDescription>
      </DialogHeader>

      <div className="h-64 w-full border rounded-md p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.is_from_user ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.is_from_user
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newMessage">Send Message</Label>
        <div className="flex gap-2">
          <Input
            id="newMessage"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            Send
          </Button>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  );
}