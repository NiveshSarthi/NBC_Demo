import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

// Re-export THREE and ARButton for dynamic imports
export { THREE, ARButton };

// Utility function to create a basic property model
export function createPropertyModel(): THREE.Group {
  const group = new THREE.Group();

  // Main building (box)
  const buildingGeometry = new THREE.BoxGeometry(2, 1.5, 2);
  const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0xE8E8E8 });
  const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
  building.position.y = 0.75;
  group.add(building);

  // Roof
  const roofGeometry = new THREE.ConeGeometry(1.5, 0.8, 4);
  const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 1.9;
  group.add(roof);

  // Windows (simple rectangles)
  const windowGeometry = new THREE.PlaneGeometry(0.3, 0.3);
  const windowMaterial = new THREE.MeshBasicMaterial({
    color: 0x87CEEB,
    transparent: true,
    opacity: 0.7
  });

  // Front windows
  const frontWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
  frontWindow1.position.set(-0.5, 0.5, 1.01);
  group.add(frontWindow1);

  const frontWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
  frontWindow2.position.set(0.5, 0.5, 1.01);
  group.add(frontWindow2);

  // Door
  const doorGeometry = new THREE.PlaneGeometry(0.4, 0.8);
  const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 0.4, 1.01);
  group.add(door);

  return group;
}

// Utility function to check WebXR support
export async function checkARSupport(): Promise<boolean> {
  if ('xr' in navigator) {
    try {
      return await navigator.xr!.isSessionSupported('immersive-ar');
    } catch {
      return false;
    }
  }
  return false;
}

// Enhanced AR setup with hit testing
export function setupARScene(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  onPlace?: (position: THREE.Vector3) => void
) {
  let hitTestSource: XRHitTestSource | null = null;
  let hitTestSourceRequested = false;

  renderer.xr.addEventListener('sessionstart', () => {
    console.log('AR session started');
  });

  renderer.xr.addEventListener('sessionend', () => {
    console.log('AR session ended');
    hitTestSource = null;
    hitTestSourceRequested = false;
  });

  const controller = renderer.xr.getController(0);
  controller.addEventListener('select', () => {
    if (hitTestSource && onPlace) {
      const referenceSpace = renderer.xr.getReferenceSpace();
      if (referenceSpace) {
        const viewerPose = renderer.xr.getFrame()?.getViewerPose(referenceSpace);
        if (viewerPose) {
          // Place object at hit test result
          onPlace(new THREE.Vector3(0, 0, -2));
        }
      }
    }
  });

  renderer.setAnimationLoop((time, frame) => {
    if (frame && !hitTestSourceRequested) {
      const session = renderer.xr.getSession();
      if (session && session.requestHitTestSource) {
        hitTestSourceRequested = true;
        (async () => {
          const referenceSpace = await session.requestReferenceSpace('viewer');
          const source = await session.requestHitTestSource!({ space: referenceSpace });
          hitTestSource = source ?? null;
        })();
      }
    }

    renderer.render(scene, camera);
  });
}