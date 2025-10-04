'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut, Play, Smartphone } from 'lucide-react';

// Tour type detection
export enum TourType {
  IMAGE_GALLERY = 'image_gallery',
  PANORAMIC_360 = 'panoramic_360',
  VIDEO_WALKTHROUGH = 'video_walkthrough',
  DRONE_FOOTAGE = 'drone_footage',
  TIME_LAPSE = 'time_lapse',
  AR_FURNITURE = 'ar_furniture'
}

export interface TourData {
  type: TourType;
  url?: string;
  images?: string[];
  title?: string;
  description?: string;
}

interface VirtualTourViewerProps {
  tourData?: TourData;
  images?: string[];
  propertyTitle: string;
  onClose?: () => void;
}

// Utility function to detect tour type from URL or data
export function detectTourType(data: any): TourType {
  if (data.drone_footage_url) return TourType.DRONE_FOOTAGE;
  if (data.time_lapse_url) return TourType.TIME_LAPSE;
  if (data.video_tour_url) return TourType.VIDEO_WALKTHROUGH;
  if (data.three_d_tour_url) return TourType.PANORAMIC_360;
  if (data.images && data.images.length > 0) return TourType.IMAGE_GALLERY;
  return TourType.IMAGE_GALLERY; // fallback
}

// Component for panoramic 360° tours using Pannellum
function PannellumViewer({ url, title }: { url: string; title: string }) {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).pannellum) {
      const pannellum = (window as any).pannellum;
      pannellum.viewer(viewerRef.current, {
        type: 'equirectangular',
        panorama: url,
        autoLoad: true,
        compass: true,
        hotSpots: [
          // Add navigation hotspots if needed
        ]
      });
    }
  }, [url]);

  return (
    <div className="relative w-full h-96">
      <div ref={viewerRef} className="w-full h-full" />
      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
        {title} - 360° Panoramic View
      </div>
    </div>
  );
}

// Component for video walkthroughs
function VideoViewer({ url, title }: { url: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={url}
        controls
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm flex items-center gap-2">
        <Play className="w-4 h-4" />
        {title} - Video Walkthrough
      </div>
    </div>
  );
}

// Component for drone footage
function DroneViewer({ url, title }: { url: string; title: string }) {
  return (
    <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
      <video
        className="w-full h-full object-cover"
        src={url}
        controls
        autoPlay
        muted
        loop
      />
      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
        {title} - Drone Footage
      </div>
    </div>
  );
}

// Component for time-lapse videos
function TimeLapseViewer({ url, title }: { url: string; title: string }) {
  return (
    <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
      <video
        className="w-full h-full object-cover"
        src={url}
        controls
        autoPlay
        muted
        loop
      />
      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-sm">
        {title} - Construction Time-lapse
      </div>
    </div>
  );
}

// Legacy image gallery viewer (original functionality)
function ImageGalleryViewer({ images, propertyTitle, onClose }: { images: string[]; propertyTitle: string; onClose?: () => void }) {
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

export function VirtualTourViewer({ tourData, images, propertyTitle, onClose }: VirtualTourViewerProps) {
  // Backward compatibility: if images prop is provided, use legacy image gallery
  if (images && images.length > 0) {
    return <ImageGalleryViewer images={images} propertyTitle={propertyTitle} onClose={onClose} />;
  }

  // New tour data structure
  if (!tourData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No virtual tour available for this property.</p>
        </CardContent>
      </Card>
    );
  }

  // Render appropriate viewer based on tour type
  switch (tourData.type) {
    case TourType.PANORAMIC_360:
      return (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{propertyTitle} - 360° Virtual Tour</h3>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
            <PannellumViewer url={tourData.url!} title={propertyTitle} />
          </CardContent>
        </Card>
      );

    case TourType.VIDEO_WALKTHROUGH:
      return (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{propertyTitle} - Video Walkthrough</h3>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
            <VideoViewer url={tourData.url!} title={propertyTitle} />
          </CardContent>
        </Card>
      );

    case TourType.DRONE_FOOTAGE:
      return (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{propertyTitle} - Drone Footage</h3>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
            <DroneViewer url={tourData.url!} title={propertyTitle} />
          </CardContent>
        </Card>
      );

    case TourType.TIME_LAPSE:
      return (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{propertyTitle} - Construction Time-lapse</h3>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
            <TimeLapseViewer url={tourData.url!} title={propertyTitle} />
          </CardContent>
        </Card>
      );

    case TourType.IMAGE_GALLERY:
    default:
      return <ImageGalleryViewer images={tourData.images || []} propertyTitle={propertyTitle} onClose={onClose} />;
  }
}