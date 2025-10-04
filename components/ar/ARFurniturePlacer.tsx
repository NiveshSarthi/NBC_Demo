'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Smartphone, RotateCcw, Plus, Minus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ARFurniturePlacerProps {
  propertyTitle: string;
  propertyId: string;
  onClose?: () => void;
}

interface FurnitureItem {
  id: string;
  name: string;
  modelUrl?: string;
  geometry: 'box' | 'cylinder' | 'sphere';
  size: [number, number, number];
  color: string;
  position: [number, number, number];
}

const FURNITURE_PRESETS: Omit<FurnitureItem, 'id' | 'position'>[] = [
  { name: 'Chair', geometry: 'cylinder', size: [0.5, 1, 0.5], color: '#8B4513' },
  { name: 'Table', geometry: 'box', size: [1.5, 0.8, 1], color: '#F5F5DC' },
  { name: 'Sofa', geometry: 'box', size: [2, 1, 1], color: '#4169E1' },
  { name: 'Bed', geometry: 'box', size: [2, 0.5, 1.5], color: '#FFFFFF' },
  { name: 'Cabinet', geometry: 'box', size: [0.8, 2, 0.4], color: '#8B4513' },
];

export function ARFurniturePlacer({ propertyTitle, propertyId, onClose }: ARFurniturePlacerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [is3DPreviewActive, setIs3DPreviewActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([]);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [isPlacingMode, setIsPlacingMode] = useState(false);

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

    return () => {
      // Cleanup
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const addFurniture = (preset: Omit<FurnitureItem, 'id' | 'position'>) => {
    const newItem: FurnitureItem = {
      ...preset,
      id: Date.now().toString(),
      position: [0, 0, -2], // Default position in front of camera
    };
    setFurnitureItems([...furnitureItems, newItem]);
    setSelectedFurniture(newItem.id);
    setIsPlacingMode(true);
  };

  const removeFurniture = (id: string) => {
    setFurnitureItems(furnitureItems.filter(item => item.id !== id));
    if (selectedFurniture === id) {
      setSelectedFurniture(null);
      setIsPlacingMode(false);
    }
  };

  const createFurnitureMesh = async (item: FurnitureItem) => {
    const THREE = await import('three');

    let geometry;
    switch (item.geometry) {
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(item.size[0] / 2, item.size[0] / 2, item.size[1], 16);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(item.size[0] / 2, 16, 16);
        break;
      default:
        geometry = new THREE.BoxGeometry(...item.size);
    }

    const material = new THREE.MeshPhongMaterial({ color: item.color });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(...item.position);
    mesh.userData = { id: item.id };
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  };

  const startAR = async () => {
    if (!containerRef.current || !isARSupported) return;

    try {
      const THREE = await import('three');
      const { ARButton } = await import('three/examples/jsm/webxr/ARButton.js');

      // Initialize AR scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.xr.enabled = true;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);

      // Add lighting
      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      scene.add(light);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      // Add existing furniture items
      for (const item of furnitureItems) {
        const mesh = await createFurnitureMesh(item);
        scene.add(mesh);
      }

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

      // Raycaster for furniture selection
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onMouseClick = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
          const clickedObject = intersects[0].object;
          if (clickedObject.userData?.id) {
            setSelectedFurniture(clickedObject.userData.id);
          }
        }
      };

      renderer.domElement.addEventListener('click', onMouseClick);

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
      const THREE = await import('three');

      // Initialize 3D scene for desktop preview
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
      camera.position.set(5, 3, 5);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);

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

      // Add existing furniture items
      for (const item of furnitureItems) {
        const mesh = await createFurnitureMesh(item);
        scene.add(mesh);
      }

      // Add orbit controls
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = true;
      controls.enablePan = false;

      // Handle furniture selection and placement
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onMouseClick = (event: MouseEvent) => {
        if (!isPlacingMode || !selectedFurniture) return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(ground);

        if (intersects.length > 0) {
          const point = intersects[0].point;
          const currentItem = furnitureItems.find(item => item.id === selectedFurniture);

          if (currentItem) {
            setFurnitureItems(items =>
              items.map(item =>
                item.id === selectedFurniture
                  ? { ...item, position: [point.x, point.y + item.size[1] / 2, point.z] }
                  : item
              )
            );

            // Update mesh position
            const mesh = scene.children.find(child => child.userData?.id === selectedFurniture);
            if (mesh) {
              mesh.position.set(point.x, point.y + currentItem.size[1] / 2, point.z);
            }
          }

          setIsPlacingMode(false);
        }
      };

      renderer.domElement.addEventListener('click', onMouseClick);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
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

  const resetView = () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    setIsARActive(false);
    setIs3DPreviewActive(false);
    setError(null);
    setSelectedFurniture(null);
    setIsPlacingMode(false);
  };

  const saveArrangement = () => {
    // In a real implementation, this would save to backend
    console.log('Saving furniture arrangement:', furnitureItems);
    alert('Furniture arrangement saved! (This is a demo - data not actually saved)');
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          AR Furniture Placer - {propertyTitle}
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

        {/* Furniture Controls */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <h4 className="font-semibold w-full">Add Furniture:</h4>
            {FURNITURE_PRESETS.map((preset, index) => (
              <Button
                key={index}
                onClick={() => addFurniture(preset)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {preset.name}
              </Button>
            ))}
          </div>

          {/* Current Furniture List */}
          {furnitureItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Current Furniture:</h4>
              <div className="flex flex-wrap gap-2">
                {furnitureItems.map((item) => (
                  <Badge
                    key={item.id}
                    variant={selectedFurniture === item.id ? "default" : "secondary"}
                    className="cursor-pointer flex items-center gap-1"
                    onClick={() => setSelectedFurniture(item.id)}
                  >
                    {item.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFurniture(item.id);
                      }}
                      className="ml-1 text-xs hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Placement Instructions */}
          {selectedFurniture && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isPlacingMode
                  ? "Click on the ground plane to place the selected furniture item."
                  : "Furniture item selected. Click 'Place Furniture' to position it."}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* AR/3D Controls */}
        <div className="flex gap-2 justify-center flex-wrap">
          {isARSupported && !isARActive && !is3DPreviewActive && (
            <Button onClick={startAR} size="lg" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Start AR Furniture Placement
            </Button>
          )}

          {!isARSupported && !is3DPreviewActive && (
            <Button onClick={start3DPreview} size="lg" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Start 3D Furniture Preview
            </Button>
          )}

          {selectedFurniture && !isPlacingMode && (isARActive || is3DPreviewActive) && (
            <Button
              onClick={() => setIsPlacingMode(true)}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              Place Selected Furniture
            </Button>
          )}

          {furnitureItems.length > 0 && (
            <Button onClick={saveArrangement} variant="outline" size="lg">
              Save Arrangement
            </Button>
          )}

          {(isARActive || is3DPreviewActive) && (
            <Button onClick={resetView} variant="outline" size="lg" className="flex items-center gap-2">
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
                  <p>Click "Start AR Furniture Placement" to design your space</p>
                  <p className="text-sm mt-2">Add furniture and place them in augmented reality</p>
                </div>
              ) : (
                <div>
                  <RotateCcw className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Design your space with 3D furniture placement</p>
                  <p className="text-sm mt-2">Click "Start 3D Furniture Preview" to arrange furniture</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        {isARActive && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Add furniture from the options above</p>
            <p>• Select furniture and click "Place Furniture"</p>
            <p>• Tap/click on surfaces to place items</p>
            <p>• Move around to explore your design</p>
            <p>• Save your arrangement when finished</p>
          </div>
        )}

        {is3DPreviewActive && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Add furniture from the options above</p>
            <p>• Select furniture and click "Place Furniture"</p>
            <p>• Click on the ground to place items</p>
            <p>• Drag to rotate view, scroll to zoom</p>
            <p>• Save your arrangement when finished</p>
          </div>
        )}

        {/* Fallback Content */}
        {!isARSupported && !is3DPreviewActive && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Design Options:</h4>
            <ul className="text-sm space-y-1">
              <li>• Click "Start 3D Furniture Preview" for interactive design</li>
              <li>• Add furniture items from the presets above</li>
              <li>• Place and arrange items in 3D space</li>
              <li>• Save your custom furniture arrangement</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}