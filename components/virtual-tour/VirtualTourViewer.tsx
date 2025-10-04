'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface VirtualTourViewerProps {
  images: string[];
  propertyTitle: string;
  onClose?: () => void;
}

export function VirtualTourViewer({ images, propertyTitle, onClose }: VirtualTourViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentImageIndex];

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setRotation(0);
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setRotation(0);
    setZoom(1);
  };

  const handleReset = () => {
    setRotation(0);
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const rotationSpeed = 0.5; // degrees per pixel
    setRotation((prev) => prev + deltaX * rotationSpeed);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + zoomSpeed, 3));
    } else {
      setZoom((prev) => Math.max(prev - zoomSpeed, 0.5));
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  if (!images || images.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No virtual tour images available for this property.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{propertyTitle} - Virtual Tour</h3>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600">
              {currentImageIndex + 1} of {images.length}
            </span>
            <Button variant="outline" size="sm" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Viewer */}
        <div
          ref={viewerRef}
          className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          style={{
            backgroundImage: `url(${currentImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Overlay for rotation effect */}
          <div
            className="absolute inset-0"
            style={{
              transform: `rotateY(${rotation}deg) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          />

          {/* Navigation hotspots (placeholder) */}
          <div className="absolute top-1/2 left-4 w-3 h-3 bg-blue-500 rounded-full cursor-pointer opacity-75 hover:opacity-100"
               title="Navigate to next room" />
          <div className="absolute top-1/2 right-4 w-3 h-3 bg-blue-500 rounded-full cursor-pointer opacity-75 hover:opacity-100"
               title="Navigate to previous room" />
        </div>

        {/* Instructions */}
        <div className="mt-4 text-sm text-gray-600">
          <p>• Drag to rotate the view</p>
          <p>• Use mouse wheel to zoom in/out</p>
          <p>• Click navigation dots to move between rooms</p>
        </div>
      </CardContent>
    </Card>
  );
}