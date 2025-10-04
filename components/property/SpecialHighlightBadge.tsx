"use client";

import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import type { Property } from "@prisma/client";

// Make the entire Dialog component client-only to prevent hydration errors
const GiftPackDialogClient = dynamic(() => import("@/components/property/GiftPackDialogClient").then(mod => mod.GiftPackDialogClient), { ssr: false });

interface SpecialHighlightBadgeProps {
  property: Property;
}

const badgeStyles: Record<string, string> = {
  "Gift Pack Included": "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-transparent",
  "Ready to Move": "bg-green-500 text-white border-transparent",
  "Price Drop": "bg-red-500 text-white border-transparent",
  "New Launch": "bg-blue-500 text-white border-transparent",
  "Last Few Units": "bg-orange-500 text-white border-transparent",
  "Exclusive Deal": "bg-purple-500 text-white border-transparent",
};

const emojiMap: Record<string, string> = {
  "Gift Pack Included": "✨",
  "Ready to Move": "",
  "Price Drop": "⬇️",
  "New Launch": "🏗️",
  "Last Few Units": "⚠️",
  "Exclusive Deal": "💎",
};

function getHighlightTypes(property: Property): string[] {
  // If highlight_types field exists and has values, use it directly
  if (property.highlight_types && property.highlight_types.length > 0) {
    return property.highlight_types;
  }

  // Fallback to calculated types
  const types: string[] = [];

  if (property.gift_pack) {
    types.push("Gift Pack Included");
  }

  if (property.possession_status === "ready_to_move") {
    types.push("Ready to Move");
  }

  if (property.price_drop_amount) {
    types.push("Price Drop");
  }

  if (property.possession_status === "new_launch" || property.is_new_launch) {
    types.push("New Launch");
  }

  if (property.units_left !== null && property.units_left <= 10) {
    types.push("Last Few Units");
  }

  if (property.premium_listing) {
    types.push("Exclusive Deal");
  }

  return types;
}

export function SpecialHighlightBadge({ property }: SpecialHighlightBadgeProps) {
  const highlightTypes = getHighlightTypes(property);

  if (highlightTypes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {highlightTypes.map((type) => {
        if (type === "Gift Pack Included") {
          return (
            <GiftPackDialogClient key={type} property={property} />
          );
        }

        return (
          <Badge key={type} className={badgeStyles[type]}>
            {emojiMap[type] && <span className="mr-1">{emojiMap[type]}</span>}
            {type}
          </Badge>
        );
      })}
    </div>
  );
}