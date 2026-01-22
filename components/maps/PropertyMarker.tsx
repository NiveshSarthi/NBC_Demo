'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { Property } from '@prisma/client'

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface PropertyMarkerProps {
  property: Property
  icon?: any
}

export function PropertyMarker({ property, icon }: PropertyMarkerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Use latitude/longitude if available, otherwise default to city center approximation
  const lat = property.latitude ? Number(property.latitude) : 20.5937
  const lng = property.longitude ? Number(property.longitude) : 78.9629

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      eventHandlers={{
        click: () => setIsOpen(true)
      }}
    >
      <Popup>
        <div className="p-2 min-w-64">
          <h3 className="font-semibold text-lg">{property.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {property.city || 'Unknown City'}, {property.state || 'Unknown State'}
          </p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-green-600">
              ₹{property.price?.toLocaleString() ?? 'N/A'}
            </span>
            <span className="text-sm text-gray-500">
              {property.property_type}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <p>{property.description?.slice(0, 100) || 'No description available'}...</p>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              onClick={() => window.open(`/properties/${property.id}`, '_blank')}
            >
              View Details
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}