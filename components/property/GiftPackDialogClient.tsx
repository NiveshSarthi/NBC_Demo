"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import type { Property } from "@prisma/client";

interface GiftInclusion {
  name: string;
  value: number;
  description?: string;
}

interface Offer {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  type: string;
  is_active: boolean;
}

interface GiftPackData {
  inclusions?: GiftInclusion[];
  images?: string[];
  terms?: string;
  offers?: Offer[];
}

// Dynamically import GiftPackShowcase to avoid any potential issues
const GiftPackShowcase = dynamic(() => import("@/components/property/GiftPackShowcase").then(mod => mod.GiftPackShowcase), { ssr: false });

interface GiftPackDialogClientProps {
  property: Property;
}

export function GiftPackDialogClient({ property }: GiftPackDialogClientProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-transparent cursor-pointer hover:opacity-90 transition-opacity"
        >
          <span className="mr-1">✨</span>
          Gift Pack Included
        </Badge>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gift Pack Details</DialogTitle>
          <DialogDescription>
            Details of the gift pack included with this property.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <GiftPackShowcase giftPack={property.gift_pack} />
        </div>
      </DialogContent>
    </Dialog>
  );
}