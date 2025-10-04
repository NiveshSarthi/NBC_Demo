'use client'

import { useEffect } from 'react'
import { GeoJSON as LeafletGeoJSON } from 'leaflet'
import dynamic from 'next/dynamic'

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