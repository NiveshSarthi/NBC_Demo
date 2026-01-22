'use client'

import dynamic from 'next/dynamic'
import type { GeoJSON as LeafletGeoJSON } from 'leaflet'

const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
)

interface GeoJSONLayerProps {
  data: any
  style?: (feature?: any) => any
  onEachFeature?: (feature: any, layer: LeafletGeoJSON) => void
  pointToLayer?: (feature: any, latlng: any) => any
}

export function GeoJSONLayer({
  data,
  style,
  onEachFeature,
  pointToLayer
}: GeoJSONLayerProps) {
  return (
    <GeoJSON
      data={data}
      style={style}
      onEachFeature={onEachFeature}
      pointToLayer={pointToLayer}
    />
  )
}