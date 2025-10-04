'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

interface BaseMapProps {
  children?: React.ReactNode
  center?: [number, number]
  zoom?: number
  className?: string
  style?: React.CSSProperties
}

export function BaseMap({
  children,
  center = [20.5937, 78.9629], // Center of India
  zoom = 5,
  className = "h-96 w-full rounded-lg border",
  style
}: BaseMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div
        className={className}
        style={style}
      >
        <div className="flex items-center justify-center h-full bg-gray-100">
          Loading map...
        </div>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={style}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  )
}