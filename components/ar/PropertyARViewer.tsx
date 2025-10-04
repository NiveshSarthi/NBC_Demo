'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Smartphone, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PropertyARViewerProps {
  propertyTitle: string;
  propertyId: string;
  onClose?: () => void;
}

export function PropertyARViewer({ propertyTitle, propertyId, onClose }: PropertyARViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [is3DPreviewActive, setIs3DPreviewActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check WebXR support
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
        setIsARSupported(supported);
      }).catch(() => {
        setIsARSupported(false);
      });
    } else {
      setIsARSupported(false);
    }
  }, []);

  const startAR = async () => {
    if (!containerRef.current || !isARSupported) return;

    try {
      // Dynamic import to avoid SSR issues
      const THREE = await import('three');
      const { ARButton } = await import('three/examples/jsm/webxr/ARButton.js');

      // Initialize AR scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.xr.enabled = true;

      containerRef.current.innerHTML = ''; // Clear container
      containerRef.current.appendChild(renderer.domElement);

      // Create basic property model (simple house shape)
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
      const house = new THREE.Mesh(geometry, material);
      house.position.set(0, 0.5, -2);
      scene.add(house);

      // Add roof
      const roofGeometry = new THREE.ConeGeometry(0.8, 0.5, 4);
      const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, 1.25, -2);
      scene.add(roof);

      // Add lighting
      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      scene.add(light);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight.position.set(10, 10, 5);
      scene.add(directionalLight);

      // Add AR button
      const arButton = ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay']
      });
      arButton.style.position = 'absolute';
      arButton.style.bottom = '20px';
      arButton.style.right = '20px';
      arButton.style.zIndex = '1000';
      containerRef.current.appendChild(arButton);

      // Animation loop
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });

      setIsARActive(true);
      setError(null);

    } catch (err) {
      console.error('AR initialization failed:', err);
      setError('Failed to initialize AR. Please try again.');
    }
  };

  const start3DPreview = async () => {
    if (!containerRef.current) return;

    try {
      // Dynamic import to avoid SSR issues
      const THREE = await import('three');

      // Initialize 3D scene for desktop preview
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);

      const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
      camera.position.set(3, 2, 5);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      containerRef.current.innerHTML = ''; // Clear container
      containerRef.current.appendChild(renderer.domElement);

      // Create property model based on propertyId
      let propertyGroup = new THREE.Group();

      if (propertyId.includes('villa')) {
        // Create villa model
        const houseGeometry = new THREE.BoxGeometry(2, 1.5, 1.5);
        const houseMaterial = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
        const house = new THREE.Mesh(houseGeometry, houseMaterial);
        house.position.y = 0.75;
        house.castShadow = true;
        house.receiveShadow = true;
        propertyGroup.add(house);

        // Add roof
        const roofGeometry = new THREE.ConeGeometry(1.8, 0.8, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 2.2;
        roof.castShadow = true;
        propertyGroup.add(roof);

        // Add windows
        const windowGeometry = new THREE.PlaneGeometry(0.3, 0.3);
        const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.7 });

        const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
        window1.position.set(-0.5, 0.5, 0.76);
        propertyGroup.add(window1);

        const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
        window2.position.set(0.5, 0.5, 0.76);
        propertyGroup.add(window2);
      } else if (propertyId.includes('temple')) {
        // Create temple land model
        const landGeometry = new THREE.BoxGeometry(4, 0.2, 3);
        const landMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const land = new THREE.Mesh(landGeometry, landMaterial);
        land.position.y = 0.1;
        land.receiveShadow = true;
        propertyGroup.add(land);

        // Add temple structure
        const templeGeometry = new THREE.BoxGeometry(1.5, 2, 1);
        const templeMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
        const temple = new THREE.Mesh(templeGeometry, templeMaterial);
        temple.position.y = 1.1;
        temple.castShadow = true;
        propertyGroup.add(temple);

        // Add temple roof
        const templeRoofGeometry = new THREE.ConeGeometry(1.2, 0.8, 4);
        const templeRoofMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        const templeRoof = new THREE.Mesh(templeRoofGeometry, templeRoofMaterial);
        templeRoof.position.y = 2.5;
        templeRoof.castShadow = true;
        propertyGroup.add(templeRoof);
      } else {
        // Default commercial building model
        const buildingGeometry = new THREE.BoxGeometry(2.5, 4, 2);
        const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = 2;
        building.castShadow = true;
        building.receiveShadow = true;
        propertyGroup.add(building);

        // Add windows grid
        const windowGeometry = new THREE.PlaneGeometry(0.2, 0.3);
        const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.8 });

        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 4; j++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(-0.8 + i * 0.6, 0.5 + j * 0.8, 1.01);
            propertyGroup.add(window);
          }
        }
      }

      scene.add(propertyGroup);

      // Add ground plane
      const groundGeometry = new THREE.PlaneGeometry(10, 10);
      const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      ground.receiveShadow = true;
      scene.add(ground);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      scene.add(directionalLight);

      // Add orbit controls for interaction
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = true;
      controls.enablePan = false;

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        propertyGroup.rotation.y += 0.005; // Slow rotation
        renderer.render(scene, camera);
      };
      animate();

      setIs3DPreviewActive(true);
      setError(null);

    } catch (err) {
      console.error('3D preview initialization failed:', err);
      setError('Failed to initialize 3D preview. Please try again.');
    }
  };

  const resetAR = () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    setIsARActive(false);
    setIs3DPreviewActive(false);
    setError(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          AR Property Viewer - {propertyTitle}
        </CardTitle>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AR Support Check */}
        {isARSupported === false && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              AR is not supported on this device. Try using a modern mobile device with AR support (iOS Safari or Android Chrome).
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* AR/3D Controls */}
        <div className="flex gap-2 justify-center">
          {isARSupported && !isARActive && !is3DPreviewActive && (
            <Button onClick={startAR} size="lg" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Start AR Experience
            </Button>
          )}

          {!isARSupported && !is3DPreviewActive && (
            <Button onClick={start3DPreview} size="lg" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Start 3D Preview
            </Button>
          )}

          {(isARActive || is3DPreviewActive) && (
            <Button onClick={resetAR} variant="outline" size="lg" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset View
            </Button>
          )}
        </div>

        {/* AR Container */}
        <div
          ref={containerRef}
          className="w-full h-96 md:h-[500px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden"
          style={{ minHeight: '400px' }}
        >
          {!isARActive && !is3DPreviewActive && (
            <div className="text-center text-gray-500">
              {isARSupported === null ? (
                <div>Checking AR support...</div>
              ) : isARSupported ? (
                <div>
                  <Smartphone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Click "Start AR Experience" to view the property in augmented reality</p>
                  <p className="text-sm mt-2">Point your camera at a flat surface to place the 3D model</p>
                </div>
              ) : (
                <div>
                  <RotateCcw className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Experience a 3D preview of the property</p>
                  <p className="text-sm mt-2">Click "Start 3D Preview" to explore the interactive model</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        {isARActive && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Point your camera at a flat surface</p>
            <p>• Tap the screen to place the 3D property model</p>
            <p>• Move around to explore the property from different angles</p>
            <p>• Use pinch gestures to zoom in/out (on mobile)</p>
            <p className="md:hidden">• For best experience, use landscape orientation</p>
          </div>
        )}

        {is3DPreviewActive && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Drag to rotate the view around the property</p>
            <p>• Scroll to zoom in/out</p>
            <p>• Watch the property slowly rotate for a complete view</p>
            <p>• Use mouse controls for interactive exploration</p>
          </div>
        )}

        {/* Fallback Content */}
        {!isARSupported && !is3DPreviewActive && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Viewing Options:</h4>
            <ul className="text-sm space-y-1">
              <li>• Click "Start 3D Preview" for interactive property model</li>
              <li>• Use the Virtual Tour button for 360° image viewing</li>
              <li>• View property photos in the image gallery</li>
              <li>• Contact our agent for an in-person viewing</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}