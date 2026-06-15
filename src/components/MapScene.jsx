import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Stars, Html } from '@react-three/drei';
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

// Custom shader for the map plane to simulate living parchment
const ParchmentShaderMaterial = {
  uniforms: {
    uTexture: { value: null },
    uTime: { value: 0 },
    uGlow: { value: 0.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      // Gentle breathing wave effect across the parchment
      pos.z += sin(pos.x * 0.6 + uTime * 0.4) * 0.12;
      pos.z += cos(pos.y * 0.5 + uTime * 0.3) * 0.12;
      vPosition = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform sampler2D uTexture;
    uniform float uGlow;
    
    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      
      // Compute vignette based on distance from center
      float dist = distance(vUv, vec2(0.5));
      vec3 goldGlow = vec3(0.83, 0.68, 0.21); // gold tint
      
      // Apply gold vignette edge tint
      texColor.rgb = mix(texColor.rgb, goldGlow, dist * 0.2 * uGlow);
      
      gl_FragColor = texColor;
    }
  `
};

// Component to handle map parchment rendering
function MapPlane({ selectedLocation }) {
  const meshRef = useRef();
  const mapTexture = useTexture('/elfhame map.jpg');
  
  // Custom material ref
  const materialRef = useRef();

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTexture.value = mapTexture;
    }
  }, [mapTexture]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3.2, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 7.5, 48, 48]} />
      <shaderMaterial
        ref={materialRef}
        args={[ParchmentShaderMaterial]}
        transparent={true}
        depthWrite={true}
      />
    </mesh>
  );
}

// Particle System for drifting faerie dust
function FaerieDust() {
  const pointsRef = useRef();
  const count = 350;
  
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 15;      // X
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;  // Y
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;   // Z
    }
    return arr;
  });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const positionsArr = pointsRef.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      // Apply organic drift using sine/cosine
      positionsArr[i * 3] += Math.sin(time + i) * 0.002;
      positionsArr[i * 3 + 1] += Math.cos(time * 0.7 + i) * 0.002;
      positionsArr[i * 3 + 2] += Math.sin(time * 0.5 + i) * 0.001;
      
      // Wrap coordinates around boundaries
      if (Math.abs(positionsArr[i * 3]) > 7.5) positionsArr[i * 3] = (Math.random() - 0.5) * 15;
      if (Math.abs(positionsArr[i * 3 + 1]) > 5) positionsArr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      if (Math.abs(positionsArr[i * 3 + 2]) > 4) positionsArr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#f3e5ab" // Pale gold
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Camera controller that performs smooth zooms and mouse parallax
function CameraController({ selectedLocation, onTransitionComplete }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const targetCamPos = useRef(new THREE.Vector3(0, -3.8, 6.0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Handle mouse move for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize to -1 to 1
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle zooming when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      const loc = locations.find(l => l.id === selectedLocation);
      if (loc) {
        // Compute 3D coordinate on the tilted plane
        // Map plane is tilted around X by -Math.PI / 3.2.
        // Let's project loc.x and loc.y into 3D.
        const cosTheta = Math.cos(-Math.PI / 3.2);
        const sinTheta = Math.sin(-Math.PI / 3.2);
        
        // Unrotated coords: (x, y, 0).
        // Rotated around X: X_new = x, Y_new = y * cosTheta, Z_new = y * sinTheta.
        const px = loc.x;
        const py = loc.y * cosTheta;
        const pz = loc.y * sinTheta;

        // Set target camera position (close zoom, looking at the marker)
        const zoomCamX = px;
        const zoomCamY = py - 1.2;
        const zoomCamZ = pz + 1.8;

        gsap.to(camera.position, {
          x: zoomCamX,
          y: zoomCamY,
          z: zoomCamZ,
          duration: 2.2,
          ease: 'power3.inOut',
          onUpdate: () => {
            // Keep looking at target coordinates during zoom
            currentLookAt.current.lerp(new THREE.Vector3(px, py, pz), 0.1);
            camera.lookAt(currentLookAt.current);
          },
          onComplete: () => {
            if (onTransitionComplete) onTransitionComplete();
          }
        });
        targetLookAt.current.set(px, py, pz);
      }
    } else {
      // Zoom out to full map
      gsap.to(camera.position, {
        x: 0,
        y: -3.8,
        z: 6.0,
        duration: 2.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          currentLookAt.current.lerp(new THREE.Vector3(0, 0, 0), 0.08);
          camera.lookAt(currentLookAt.current);
        }
      });
      targetLookAt.current.set(0, 0, 0);
    }
  }, [selectedLocation, camera, onTransitionComplete]);

  // Frame loop for mouse parallax (when NOT zoomed in)
  useFrame(() => {
    if (!selectedLocation) {
      // Standard parallax adjustments
      const parallaxX = mouse.current.x * 0.8;
      const parallaxY = mouse.current.y * 0.6;
      
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, parallaxX, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, -3.8 + parallaxY, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 6.0, 0.05);
      
      currentLookAt.current.lerp(targetLookAt.current, 0.1);
      camera.lookAt(currentLookAt.current);
    }
  });

  return null;
}

// Interactive Marker component rendered in CSS overlaying R3F coordinates
function MarkerOverlay({ selectedLocation, onSelectLocation }) {
  const cosTheta = Math.cos(-Math.PI / 3.2);
  const sinTheta = Math.sin(-Math.PI / 3.2);

  return (
    <>
      {locations.map((loc) => {
        // Rotated position around X axis
        const px = loc.x;
        const py = loc.y * cosTheta;
        const pz = loc.y * sinTheta;

        const isCurrent = selectedLocation === loc.id;

        return (
          <Html
            key={loc.id}
            position={[px, py, pz + 0.15]}
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
                if (!selectedLocation) audioSynth.playMarkerHover();
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

// Main 3D Canvas wrapper
export default function MapScene({ selectedLocation, onSelectLocation, onTransitionComplete, activeScene }) {
  return (
    <div className={`map-canvas-container ${activeScene !== 'map' ? 'dissolve' : ''}`}>
      <Canvas
        camera={{ position: [0, -3.8, 6.0], fov: 60 }}
        shadows
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#050709']} />
        
        {/* Lights */}
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[5, 5, 8]}
          intensity={0.6}
          color="#d4af37" // warm sun/candle light
          castShadow
        />
        <directionalLight
          position={[-5, -2, 4]}
          intensity={0.4}
          color="#b0c4de" // cool moonlight
        />
        
        {/* Living Map Plane */}
        <MapPlane selectedLocation={selectedLocation} />
        
        {/* Particles / Dust */}
        <FaerieDust />
        
        {/* Starfield background */}
        <Stars radius={100} depth={50} count={300} factor={4} saturation={0.5} fade speed={1} />
        
        {/* Markers Overlay */}
        {activeScene === 'map' && (
          <MarkerOverlay
            selectedLocation={selectedLocation}
            onSelectLocation={onSelectLocation}
          />
        )}
        
        {/* Camera transitions */}
        <CameraController
          selectedLocation={selectedLocation}
          onTransitionComplete={onTransitionComplete}
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
