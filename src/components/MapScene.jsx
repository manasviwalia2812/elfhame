import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Stars, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import audioSynth from '../utils/audio';

// Location coordinate definitions on the tilted 3D plane
export const locations = [
  {
    id: 'palace',
    name: 'Palace of Elfhame',
    x: 0.1,
    y: 0.6,
    z: 0.0,
    color: '#d4af37', // Gold
    description: 'The royal seat of the High King, balancing on trees and stone columns above the sea. Beautiful, intimidating, and filled with dark court intrigue.',
    quote: '"Most of all, I hate him because I think of him, often. It\'s like a disease."',
  },
  {
    id: 'hollow_hall',
    name: 'Hollow Hall',
    x: -2.2,
    y: 1.4,
    z: 0.0,
    color: '#0f8558', // Emerald
    description: 'The estate of General Madoc, Jude\'s foster father. A fortress of weapons, war planning, and ancient faerie military power.',
    quote: '"If I cannot be better than them, I will become so much worse."',
  },
  {
    id: 'tower_forgetting',
    name: 'Tower of Forgetting',
    x: 3.2,
    y: 1.8,
    z: 0.0,
    color: '#b0c4de', // Silver
    description: 'A grim prison built on an isolated spire. Those who defy the crown are locked away here to be slowly forgotten.',
    quote: '"We have spoken of the dead. Now let us speak of the living."',
  },
  {
    id: 'locke_estate',
    name: 'Locke\'s Estate',
    x: 1.6,
    y: -0.6,
    z: 0.0,
    color: '#a82c2c', // Ruby
    description: 'A place of sensory indulgence, wild feasts, and devious trickery. Where Locke hosts his decadent, chaotic gatherings.',
    quote: '"If you hurt me, I will find a way to hurt you back. Twice as hard."',
  },
  {
    id: 'lake_masks',
    name: 'Lake of Masks',
    x: -1.0,
    y: -1.2,
    z: 0.0,
    color: '#1e5aa8', // Sapphire
    description: 'A mystical body of water that reflects not your face, but your deepest illusions, desires, and secrets.',
    quote: '"I want to win. I do not yearn to be good."',
  },
  {
    id: 'crown_forest',
    name: 'Crown Forest',
    x: -1.6,
    y: 0.2,
    z: 0.0,
    color: '#2e5a1c', // Forest Green
    description: 'The ancient, dense woodland surrounding the palace. Home to wild beasts, rogue sprites, and hidden spy camps.',
    quote: '"Power is much easier to acquire than it is to hold onto."',
  },
  {
    id: 'undersea',
    name: 'Undersea Kingdom',
    x: 2.6,
    y: -2.0,
    z: 0.0,
    color: '#1d8585', // Teal
    description: 'The cold, vast aquatic domain ruled by Queen Orlagh. Cruel, deep, and constantly plotting to pull the land under.',
    quote: '"In faerie, you can die of a transition."',
  },
  {
    id: 'market',
    name: 'Market District',
    x: -2.8,
    y: -1.5,
    z: 0.0,
    color: '#b87333', // Copper
    description: 'The docks and bustling market stalls where mortals and fae exchange enchanted wares, poisons, and rumors.',
    quote: '"Sharpen your blade. Harden your heart."',
  }
];

// Curvature bending math function for the atlas geometries
const getCurveY = (x, y) => {
  return 0.35 * Math.cos((x / 10) * Math.PI) + 0.15 * Math.cos((y / 7.5) * Math.PI);
};

// Controls, Transitions, Hover-focusing, and Pan boundaries controller
function AtlasControls({ selectedLocation, onTransitionComplete, hoveredLocationId }) {
  const { camera } = useThree();
  const controlsRef = useRef();
  
  const isTransitioning = useRef(false);
  const targetPosition = useRef(new THREE.Vector3(0, -2.8, 6.8));
  const targetTarget = useRef(new THREE.Vector3(0, 0, 0));
  
  const lastInteractionTime = useRef(0);
  const isInteracting = useRef(false);
  const hoverTargetOffset = useRef(new THREE.Vector3(0, 0, 0));

  // Initialize camera and target positioning
  useEffect(() => {
    camera.position.set(0, -2.8, 6.8);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [camera]);

  // Handle selected location changes to animate zoom / overview transitions
  useEffect(() => {
    const theta = -Math.PI / 2.5; // flatter orientation
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    if (selectedLocation) {
      const loc = locations.find(l => l.id === selectedLocation);
      if (loc) {
        const pz_local = getCurveY(loc.x, loc.y) + 0.12;
        const px = loc.x;
        const py = loc.y * cosTheta - pz_local * sinTheta;
        const pz = loc.y * sinTheta + pz_local * cosTheta;

        targetTarget.current.set(px, py, pz);
        // Zoom-in position: look down slightly closer
        targetPosition.current.set(px, py - 1.2, pz + 1.85);
        isTransitioning.current = true;
      }
    } else {
      // Zoom out to overview
      targetTarget.current.set(0, 0, 0);
      targetPosition.current.set(0, -2.8, 6.8);
      isTransitioning.current = true;
    }
  }, [selectedLocation]);

  // Handle hover focus offsets
  useEffect(() => {
    if (hoveredLocationId && !selectedLocation) {
      const loc = locations.find(l => l.id === hoveredLocationId);
      if (loc) {
        const theta = -Math.PI / 2.5;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        const pz_local = getCurveY(loc.x, loc.y) + 0.12;
        const px = loc.x;
        const py = loc.y * cosTheta - pz_local * sinTheta;
        const pz = loc.y * sinTheta + pz_local * cosTheta;

        // Subtle camera target shift towards hovered location (18% of vector)
        hoverTargetOffset.current.set(px * 0.18, py * 0.18, pz * 0.18);
      }
    } else {
      hoverTargetOffset.current.set(0, 0, 0);
    }
  }, [hoveredLocationId, selectedLocation]);

  const handleControlsChange = () => {
    lastInteractionTime.current = performance.now();
  };

  const handleControlsStart = () => {
    isInteracting.current = true;
    isTransitioning.current = false; // Immediately interrupt transitions if user drags
  };

  const handleControlsEnd = () => {
    isInteracting.current = false;
    lastInteractionTime.current = performance.now();
  };

  useFrame((state) => {
    if (!controlsRef.current) return;

    // 1. Zoom Transition
    if (isTransitioning.current) {
      camera.position.lerp(targetPosition.current, 0.06);
      controlsRef.current.target.lerp(targetTarget.current, 0.06);
      controlsRef.current.update();

      const distPos = camera.position.distanceTo(targetPosition.current);
      const distTar = controlsRef.current.target.distanceTo(targetTarget.current);
      
      if (distPos < 0.05 && distTar < 0.05) {
        isTransitioning.current = false;
        if (selectedLocation && onTransitionComplete) {
          onTransitionComplete();
        }
      }
    } else {
      // 2. Hover focus target slide (only when idle and overview mode)
      if (!isInteracting.current && !selectedLocation) {
        const targetT = new THREE.Vector3(0, 0, 0).add(hoverTargetOffset.current);
        controlsRef.current.target.lerp(targetT, 0.05);
        controlsRef.current.update();
      }
      
      // 3. Keep target locked within coordinates box to prevent panning off-screen
      controlsRef.current.target.x = THREE.MathUtils.clamp(controlsRef.current.target.x, -3.5, 3.5);
      controlsRef.current.target.y = THREE.MathUtils.clamp(controlsRef.current.target.y, -2.5, 2.5);
      controlsRef.current.target.z = THREE.MathUtils.clamp(controlsRef.current.target.z, -1.5, 1.5);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      minPolarAngle={Math.PI / 5.1} // 35 degrees
      maxPolarAngle={Math.PI / 2.1} // 85 degrees
      minDistance={2.8}
      maxDistance={11.0}
      enableDamping={true}
      dampingFactor={0.05}
      onChange={handleControlsChange}
      onStart={handleControlsStart}
      onEnd={handleControlsEnd}
    />
  );
}

// Interactive Marker component rendered in CSS overlaying R3F coordinates
function MarkerOverlay({ selectedLocation, onSelectLocation, onHoverLocation }) {
  return (
    <>
      {locations.map((loc) => {
        const px = loc.x;
        const py = loc.y;
        const pz = getCurveY(loc.x, loc.y) + 0.12;

        const isCurrent = selectedLocation === loc.id;

        return (
          <Html
            key={loc.id}
            position={[px, py, pz]}
            center
            distanceFactor={8}
            zIndexRange={[10, 50]}
          >
            <div
              className={`marker-container ${isCurrent ? 'selected' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isCurrent) {
                  audioSynth.playMarkerClick();
                  onSelectLocation(loc.id);
                }
              }}
              onMouseEnter={() => {
                if (!selectedLocation) {
                  audioSynth.playMarkerHover();
                  onHoverLocation(loc.id);
                }
              }}
              onMouseLeave={() => {
                onHoverLocation(null);
              }}
            >
              <div 
                className="marker-dot" 
                style={{ 
                  '--marker-color': loc.color,
                  '--marker-glow': `${loc.color}66`
                }}
              />
              <div className="marker-ripple" style={{ borderColor: loc.color }} />
              <div className="marker-label">
                <span className="label-name">{loc.name}</span>
              </div>
            </div>
          </Html>
        );
      })}
    </>
  );
}

// 3D Floating Atlas nested structure
function FloatingAtlas({ selectedLocation, onSelectLocation, onHoverLocation, activeScene }) {
  const floatGroupRef = useRef();
  const mapTexture = useTexture('/elfhame_map.jpeg');
  
  const lastInteractionTime = useRef(0);
  const idleFactor = useRef(1);

  // Monitor general user input events to track idle vs active mode
  useEffect(() => {
    const activity = () => {
      lastInteractionTime.current = performance.now();
    };
    window.addEventListener('mousemove', activity);
    window.addEventListener('mousedown', activity);
    window.addEventListener('wheel', activity);
    window.addEventListener('touchstart', activity);
    
    return () => {
      window.removeEventListener('mousemove', activity);
      window.removeEventListener('mousedown', activity);
      window.removeEventListener('wheel', activity);
      window.removeEventListener('touchstart', activity);
    };
  }, []);

  // Create rounded rectangle path for the parchment
  const parchmentShape = useMemo(() => {
    const w = 10;
    const h = 7.5;
    const r = 0.2;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return shape;
  }, []);

  // Create rounded rectangle path for the leather cover
  const coverShape = useMemo(() => {
    const w = 10.3;
    const h = 7.8;
    const r = 0.25;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return shape;
  }, []);

  // Create a gold border outline (a frame with a hole cut out)
  const frameShape = useMemo(() => {
    const outerW = 10.2;
    const outerH = 7.7;
    const innerW = 9.75;
    const innerH = 7.25;
    const r = 0.22;

    const shape = new THREE.Shape();
    
    // Outer frame (CCW)
    const ow = outerW / 2;
    const oh = outerH / 2;
    shape.moveTo(-ow + r, -oh);
    shape.lineTo(ow - r, -oh);
    shape.quadraticCurveTo(ow, -oh, ow, -oh + r);
    shape.lineTo(ow, oh - r);
    shape.quadraticCurveTo(ow, oh, ow - r, oh);
    shape.lineTo(-ow + r, oh);
    shape.quadraticCurveTo(-ow, oh, -ow, oh - r);
    shape.lineTo(-ow, -oh + r);
    shape.quadraticCurveTo(-ow, -oh, -ow + r, -oh);

    // Inner cutout hole (CW)
    const hole = new THREE.Path();
    const iw = innerW / 2;
    const ih = innerH / 2;
    const ir = Math.max(0.01, r - (ow - iw));
    
    hole.moveTo(-iw + ir, -ih);
    hole.quadraticCurveTo(-iw, -ih, -iw, -ih + ir);
    hole.lineTo(-iw, ih - ir);
    hole.quadraticCurveTo(-iw, ih, -iw + ir, ih);
    hole.lineTo(iw - ir, ih);
    hole.quadraticCurveTo(iw, ih, iw, ih - ir);
    hole.lineTo(iw, -ih + ir);
    hole.quadraticCurveTo(iw, -ih, iw - ir, -ih);
    hole.lineTo(-iw + ir, -ih);

    shape.holes.push(hole);
    return shape;
  }, []);

  // Displace and curve flat 3D geometries
  const bendGeometry = (geometry, zOffset = 0) => {
    const pos = geometry.attributes.position;
    const uvs = geometry.attributes.uv;
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const curve = getCurveY(x, y);

      pos.setZ(i, z + curve + zOffset);

      if (uvs) {
        const u = (x + 5) / 10;
        const v = (y + 3.75) / 7.5;
        uvs.setXY(i, u, v);
      }
    }
    geometry.computeVertexNormals();
  };

  // Generate Extruded, Curved Geometries
  const parchmentGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(parchmentShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 4,
      curveSegments: 32
    });
    bendGeometry(geo, 0);
    return geo;
  }, [parchmentShape]);

  const coverGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(coverShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 4,
      curveSegments: 32
    });
    bendGeometry(geo, -0.14);
    return geo;
  }, [coverShape]);

  const frameGeo = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(frameShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 4,
      curveSegments: 32
    });
    bendGeometry(geo, 0.06);
    return geo;
  }, [frameShape]);

  // Frame Loop for dynamic floating and rotation wobble
  useFrame((state) => {
    if (!floatGroupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Determine target idle state based on activity (5 seconds limit)
    const timeSinceInteraction = performance.now() - lastInteractionTime.current;
    const targetIdle = (timeSinceInteraction < 5000 || selectedLocation) ? 0 : 1;
    idleFactor.current = THREE.MathUtils.lerp(idleFactor.current, targetIdle, 0.05);

    // Compute float translations and wobble rotations scaled by the idleFactor
    const floatY = Math.sin(time * 0.8) * 0.16 * idleFactor.current;
    const floatZ = Math.cos(time * 0.6) * 0.08 * idleFactor.current;

    const wobbleX = Math.sin(time * 0.5) * 0.02 * idleFactor.current;
    const wobbleY = Math.cos(time * 0.4) * 0.02 * idleFactor.current;
    const wobbleZ = Math.sin(time * 0.3) * 0.015 * idleFactor.current;

    // Lerp coordinates
    floatGroupRef.current.position.x = THREE.MathUtils.lerp(floatGroupRef.current.position.x, 0, 0.05);
    floatGroupRef.current.position.y = THREE.MathUtils.lerp(floatGroupRef.current.position.y, floatY, 0.05);
    floatGroupRef.current.position.z = THREE.MathUtils.lerp(floatGroupRef.current.position.z, floatZ, 0.05);

    floatGroupRef.current.rotation.x = THREE.MathUtils.lerp(floatGroupRef.current.rotation.x, wobbleX, 0.05);
    floatGroupRef.current.rotation.y = THREE.MathUtils.lerp(floatGroupRef.current.rotation.y, wobbleY, 0.05);
    floatGroupRef.current.rotation.z = THREE.MathUtils.lerp(floatGroupRef.current.rotation.z, wobbleZ, 0.05);
  });

  return (
    <group ref={floatGroupRef}>
      {/* 1. Leather Backing Plate */}
      <mesh geometry={coverGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color="#1c140d"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Textured Curved Parchment Page */}
      <mesh geometry={parchmentGeo} castShadow receiveShadow>
        <meshStandardMaterial
          map={mapTexture}
          color="#fffbf2" // warm light white for optimal readability
          roughness={0.55} // slightly smoother to bounce lights
          metalness={0.05}
        />
      </mesh>

      {/* 3. Gold Beveled Frame */}
      <mesh geometry={frameGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color="#d4af37"
          roughness={0.15}
          metalness={0.9}
          emissive="#8a6f27"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* 4. Overlay HTML Markers */}
      {activeScene === 'map' && (
        <MarkerOverlay
          selectedLocation={selectedLocation}
          onSelectLocation={onSelectLocation}
          onHoverLocation={onHoverLocation}
        />
      )}
    </group>
  );
}

// Main 3D Canvas wrapper
export default function MapScene({ selectedLocation, onSelectLocation, onTransitionComplete, activeScene }) {
  const [hoveredLocationId, setHoveredLocationId] = useState(null);

  return (
    <div className={`map-canvas-container ${activeScene !== 'map' ? 'dissolve' : ''}`}>
      <Canvas
        camera={{ position: [0, -2.8, 6.8], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#050709']} />
        
        {/* Linear Fog to keep map crisp while fading background stars */}
        <fog attach="fog" args={['#050709', 8, 22]} />

        {/* Ambient & Atmosphere Lights */}
        <ambientLight intensity={0.45} />
        <hemisphereLight intensity={0.15} color="#ffffff" groundColor="#0c1214" />
        
        <directionalLight
          position={[4, 8, 6]}
          intensity={1.25}
          color="#fff2cc" // brighter warm candle highlight
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        
        <directionalLight
          position={[-6, -4, 4]}
          intensity={0.4}
          color="#a1c4fd" // cool moonlight fill
        />
        
        <spotLight
          position={[0, 4, 8]}
          intensity={1.8}
          angle={Math.PI / 3.5}
          penumbra={0.8}
          color="#fbe7b2"
          castShadow
        />
        
        {/* Base tilted group: Flatter 72 degrees top-down perspective layout */}
        <group rotation={[-Math.PI / 2.5, 0, 0]}>
          <FloatingAtlas
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation}
            onHoverLocation={setHoveredLocationId}
            activeScene={activeScene}
          />
        </group>
        

        
        {/* Stars background */}
        <Stars radius={100} depth={50} count={300} factor={4} saturation={0.5} fade speed={1} />
        
        {/* Interactive Exploration Controls & Transitions */}
        <AtlasControls
          selectedLocation={selectedLocation}
          onTransitionComplete={onTransitionComplete}
          hoveredLocationId={hoveredLocationId}
        />
      </Canvas>

      {/* Styled styles for markers inside HTML */}
      <style>{`
        .map-canvas-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          transition: opacity 1.8s ease-in-out, filter 1.8s ease-in-out;
        }
        
        .map-canvas-container.dissolve {
          opacity: 0;
          pointer-events: none;
          filter: blur(10px) brightness(0.2);
        }

        .marker-container {
          position: relative;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: translate3d(0, 0, 0);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .marker-container:hover {
          transform: scale(1.2) translateY(-5px);
        }

        .marker-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--marker-color);
          box-shadow: 0 0 12px var(--marker-color), 0 0 24px var(--marker-glow);
          border: 2px solid #fff;
          z-index: 2;
          transition: all 0.3s ease;
        }

        .marker-container:hover .marker-dot {
          box-shadow: 0 0 20px var(--marker-color), 0 0 40px var(--marker-color);
          transform: scale(1.1);
        }

        .marker-ripple {
          position: absolute;
          width: 30px;
          height: 30px;
          border: 1px solid var(--marker-color);
          border-radius: 50%;
          animation: markerPulse 2.5s infinite ease-out;
          opacity: 0;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes markerPulse {
          0% {
            transform: scale(0.4);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .marker-label {
          margin-top: 8px;
          background: rgba(11, 15, 20, 0.85);
          border: 1px solid var(--gold-dark);
          border-radius: 3px;
          padding: 3px 8px;
          pointer-events: none;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          opacity: 0.6;
          transition: opacity 0.3s ease, border-color 0.3s ease;
        }

        .marker-container:hover .marker-label {
          opacity: 1;
          border-color: var(--gold-primary);
        }

        .label-name {
          font-family: 'Cinzel', serif;
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          color: #f5f3ef;
          text-shadow: 0 0 4px rgba(0,0,0,0.8);
        }

        .marker-container.selected .marker-dot {
          background: #fff;
          box-shadow: 0 0 25px #fff;
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
}
