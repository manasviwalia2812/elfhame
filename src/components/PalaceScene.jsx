import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

// An animated hanging lantern that glows softly
function Lantern({ position, color = '#d4af37' }) {
  const lightRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Flicker intensity slightly
    if (lightRef.current) {
      lightRef.current.intensity = 1.2 + Math.sin(time * 5 + position[0]) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Lantern cap */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.08, 0.2, 0.15, 6]} />
        <meshStandardMaterial color="#332a18" roughness={0.8} metalness={0.9} />
      </mesh>
      
      {/* Glowing core */}
      <Float speed={2} floatIntensity={0.3}>
        <mesh>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </Float>
      
      {/* Point light */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={1.5}
        distance={6}
        decay={2}
        castShadow
      />
    </group>
  );
}

// Glowing vines climbing a pillar
function VineClimber({ position, height = 5 }) {
  const vineRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (vineRef.current) {
      // Slow pulsing of the glowing vine veins
      vineRef.current.material.emissiveIntensity = 0.5 + Math.sin(time + position[0]) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Spiral helix representing a vine */}
      <mesh ref={vineRef}>
        <cylinderGeometry args={[0.22, 0.22, height, 8, 1, true]} />
        <meshStandardMaterial
          color="#062e1e"
          emissive="#0f8558"
          emissiveIntensity={0.5}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}

// Palace Pillar structure
function PalacePillar({ position }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, -2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.4, 0.8]} />
        <meshStandardMaterial color="#8a6f27" roughness={0.7} metalness={0.8} />
      </mesh>
      
      {/* Shaft */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 5, 12]} />
        <meshStandardMaterial color="#d4af37" roughness={0.5} metalness={0.9} />
      </mesh>
      
      {/* Cap */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.4, 0.8]} />
        <meshStandardMaterial color="#8a6f27" roughness={0.7} metalness={0.8} />
      </mesh>

      {/* Vines wrapping the pillar */}
      <VineClimber position={[0, 0, 0]} height={5} />
      
      {/* Lantern hanging from cap */}
      <Lantern position={[0.5, 2.0, 0.5]} color="#d4af37" />
    </group>
  );
}

// Floating magical spores/particles in the Palace
function PalaceSpores() {
  const pointsRef = useRef();
  const count = 180;
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12; // X
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6; // Y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12; // Z
  }

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const positionsArr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      // Swirling motion
      positionsArr[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.003 + 0.001; // Rise slightly
      positionsArr[i * 3] += Math.cos(time * 0.3 + i) * 0.003;
      
      // Wrap-around
      if (positionsArr[i * 3 + 1] > 4) positionsArr[i * 3 + 1] = -3;
      if (Math.abs(positionsArr[i * 3]) > 6) positionsArr[i * 3] = (Math.random() - 0.5) * 12;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        color="#50c878" // Emerald green sparkles
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// A large, glowing faerie moon in the background
function RoyalMoon() {
  return (
    <group position={[0, 4, -15]}>
      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial color="#e8f4f8" />
      </mesh>
      {/* Outer glow aura using a large transparent plane */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial
          color="#a1c4fd"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <directionalLight
        color="#a1c4fd"
        intensity={1.2}
        position={[0, 0, 10]}
        castShadow
      />
    </group>
  );
}

// Scene Camera animation
function PalaceCameraRig() {
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Subtle cinematic camera pan & breathe
    state.camera.position.x = Math.sin(time * 0.15) * 1.5;
    state.camera.position.y = Math.cos(time * 0.1) * 0.4 - 0.5;
    state.camera.position.z = 7.5 + Math.sin(time * 0.08) * 0.5;
    
    // Look slightly downwards at the bridge
    state.camera.lookAt(new THREE.Vector3(0, -0.8, -1.5));
  });
  return null;
}

export default function PalaceScene({ activeScene }) {
  if (activeScene !== 'palace') return null;

  return (
    <div className="palace-canvas-container">
      <Canvas
        camera={{ position: [0, -0.5, 7.5], fov: 55 }}
        shadows
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#050b09']} />
        
        {/* Volumetric Fog */}
        <fogExp2 attach="fog" args={['#050c08', 0.065]} />
        
        {/* Ambient & Moon lighting */}
        <ambientLight intensity={0.12} />
        <RoyalMoon />
        
        {/* Spotlighting the Throne Room Entrance */}
        <spotLight
          position={[0, 8, -4]}
          angle={Math.PI / 4}
          penumbra={0.8}
          intensity={2.5}
          color="#d4af37" // Golden spotlight
          castShadow
        />

        {/* Floating Spores */}
        <PalaceSpores />
        
        {/* Stars */}
        <Stars radius={90} depth={40} count={250} factor={4} saturation={0.5} fade speed={1.5} />
        
        {/* The Enchanted Bridge / Walkway */}
        <group position={[0, -1.0, 0]}>
          {/* Main walkway */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[2.5, 18]} />
            <meshStandardMaterial
              color="#131c17"
              roughness={0.7}
              metalness={0.4}
            />
          </mesh>
          
          {/* Glowing bridge railings (left/right) */}
          <mesh position={[-1.25, 0.05, 0]} castShadow>
            <boxGeometry args={[0.08, 0.1, 18]} />
            <meshStandardMaterial color="#8a6f27" emissive="#d4af37" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[1.25, 0.05, 0]} castShadow>
            <boxGeometry args={[0.08, 0.1, 18]} />
            <meshStandardMaterial color="#8a6f27" emissive="#d4af37" emissiveIntensity={0.3} />
          </mesh>

          {/* Pillars aligning the walkway */}
          <PalacePillar position={[-2.2, 2.0, 3]} />
          <PalacePillar position={[2.2, 2.0, 3]} />
          <PalacePillar position={[-2.2, 2.0, -1.5]} />
          <PalacePillar position={[2.2, 2.0, -1.5]} />
          <PalacePillar position={[-2.2, 2.0, -6]} />
          <PalacePillar position={[2.2, 2.0, -6]} />
          
          {/* Far Throne room gate silhouette */}
          <group position={[0, 1.8, -10]}>
            {/* Archway left */}
            <mesh position={[-1.8, 0, 0]} castShadow>
              <boxGeometry args={[0.4, 4.0, 0.4]} />
              <meshStandardMaterial color="#d4af37" roughness={0.4} metalness={0.9} />
            </mesh>
            {/* Archway right */}
            <mesh position={[1.8, 0, 0]} castShadow>
              <boxGeometry args={[0.4, 4.0, 0.4]} />
              <meshStandardMaterial color="#d4af37" roughness={0.4} metalness={0.9} />
            </mesh>
            {/* Archway top */}
            <mesh position={[0, 2.0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[2.0, 2.0, 0.4, 16, 1, false, 0, Math.PI]} />
              <meshStandardMaterial color="#d4af37" roughness={0.4} metalness={0.9} />
            </mesh>
            {/* Magical Portal/Throne Light */}
            <mesh position={[0, 0, -0.2]}>
              <planeGeometry args={[3.2, 4.0]} />
              <meshBasicMaterial color="#0b1e16" />
            </mesh>
            <Lantern position={[0, 1.2, 0.2]} color="#50c878" /> {/* Emerald gate lantern */}
          </group>
        </group>
        
        {/* Cinematic camera movement */}
        <PalaceCameraRig />
      </Canvas>
      
      <style>{`
        .palace-canvas-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          animation: fadeInPalace 1.8s ease-out forwards;
        }

        @keyframes fadeInPalace {
          0% {
            opacity: 0;
            filter: blur(10px) brightness(0.2);
          }
          100% {
            opacity: 1;
            filter: blur(0) brightness(1);
          }
        }
      `}</style>
    </div>
  );
}
