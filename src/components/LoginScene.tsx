"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Sphere, Cylinder, Torus, SpotLight } from "@react-three/drei";
import * as THREE from "three";

function Couch() {
  return (
    <group position={[0, -1, 0]}>
      {/* Base */}
      <RoundedBox args={[3.5, 0.5, 1.5]} radius={0.1} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </RoundedBox>
      {/* Backrest */}
      <RoundedBox args={[3.5, 1.2, 0.4]} radius={0.1} position={[0, 1, -0.5]}>
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </RoundedBox>
      {/* Armrests */}
      <RoundedBox args={[0.4, 0.8, 1.5]} radius={0.1} position={[-1.6, 0.6, 0]}>
        <meshStandardMaterial color="#4E342E" roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.4, 0.8, 1.5]} radius={0.1} position={[1.6, 0.6, 0]}>
        <meshStandardMaterial color="#4E342E" roughness={0.8} />
      </RoundedBox>
    </group>
  );
}

function Hair({ isFemale }: { isFemale: boolean }) {
  return isFemale ? (
    <group position={[0, 1.3, -0.1]}>
      {/* Female Hair - Long */}
      <Sphere args={[0.38, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#3E2723" roughness={0.8} />
      </Sphere>
      <RoundedBox args={[0.7, 0.8, 0.4]} radius={0.2} position={[0, -0.3, -0.15]}>
        <meshStandardMaterial color="#3E2723" roughness={0.8} />
      </RoundedBox>
    </group>
  ) : (
    <group position={[0, 1.35, 0]}>
      {/* Male Hair - Short */}
      <Sphere args={[0.36, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4E342E" roughness={0.9} />
      </Sphere>
      <RoundedBox args={[0.7, 0.3, 0.5]} radius={0.1} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#4E342E" roughness={0.9} />
      </RoundedBox>
    </group>
  );
}

function Character({ position, color, scale = 1, hasGlasses = false, rotation = [0, 0, 0], isFemale = false }: { position: [number, number, number], color: string, scale?: number, hasGlasses?: boolean, rotation?: [number, number, number], isFemale?: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      // Subtle breathing animation
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.01;
      // Subtle head sway
      group.current.rotation.z = (rotation[2] || 0) + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    }
  });

  return (
    <group ref={group} position={position} rotation={new THREE.Euler(...rotation)} scale={scale}>
      {/* Body */}
      <Sphere args={[0.5, 32, 32]} position={[0, 0.5, 0]} scale={[1, 1.2, 0.8]}>
        <meshStandardMaterial color={color} roughness={0.7} />
      </Sphere>
      {/* Head */}
      <Sphere args={[0.35, 32, 32]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color="#FFCCBC" roughness={0.5} />
      </Sphere>
      
      <Hair isFemale={isFemale} />

      {/* Glasses for Male */}
      {hasGlasses && (
        <group position={[0, 1.25, 0.3]} rotation={[0, 0, 0]}>
           <Torus args={[0.08, 0.01, 16, 32]} position={[-0.12, 0, 0]}>
             <meshStandardMaterial color="#333" />
           </Torus>
           <Torus args={[0.08, 0.01, 16, 32]} position={[0.12, 0, 0]}>
             <meshStandardMaterial color="#333" />
           </Torus>
           <Cylinder args={[0.005, 0.005, 0.25]} rotation={[0, 0, 90]} position={[0, 0, 0]}>
             <meshStandardMaterial color="#333" />
           </Cylinder>
        </group>
      )}
    </group>
  );
}

function Table() {
  return (
    <group position={[0, -0.5, 2]}>
      {/* Table Top */}
      <RoundedBox args={[2, 0.1, 1.2]} radius={0.05} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#8D6E63" roughness={0.6} />
      </RoundedBox>
      {/* Legs */}
      <Cylinder args={[0.05, 0.05, 0.5]} position={[-0.8, 0.25, -0.4]}>
        <meshStandardMaterial color="#5D4037" />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 0.5]} position={[0.8, 0.25, -0.4]}>
        <meshStandardMaterial color="#5D4037" />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 0.5]} position={[-0.8, 0.25, 0.4]}>
        <meshStandardMaterial color="#5D4037" />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 0.5]} position={[0.8, 0.25, 0.4]}>
        <meshStandardMaterial color="#5D4037" />
      </Cylinder>
    </group>
  );
}

function ProjectorBeam() {
  const beamRef = useRef<THREE.Mesh>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (beamRef.current && screenRef.current) {
        // Flicker effect
        const flicker = 0.8 + Math.sin(state.clock.elapsedTime * 10) * 0.1 + Math.random() * 0.1;
        (beamRef.current.material as THREE.MeshBasicMaterial).opacity = 0.05 * flicker;
        (screenRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 * flicker;
        
        // Color shift effect (subtle movie colors)
        const time = state.clock.elapsedTime;
        const r = 0.5 + Math.sin(time * 0.5) * 0.2;
        const g = 0.5 + Math.cos(time * 0.7) * 0.2;
        const b = 0.8;
        (screenRef.current.material as THREE.MeshBasicMaterial).color.setRGB(r, g, b);
    }
  });

  return (
    <group position={[0, 0.15, 2]} rotation={[0, 0, 0]}>
       {/* The Projector Unit (Hidden/Subtle) */}
       {/* <RoundedBox args={[0.4, 0.2, 0.4]} radius={0.02} position={[0, 0, 0]}>
         <meshStandardMaterial color="#212121" roughness={0.5} />
       </RoundedBox> */}
       
       {/* The Beam Cone - projecting forward (negative Z) */}
       <mesh ref={beamRef} position={[0, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]}>
         <coneGeometry args={[1.8, 5, 32, 1, true]} />
         <meshBasicMaterial color="#E0F7FA" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
       </mesh>

       {/* The Screen (Projected Image) */}
       <mesh ref={screenRef} position={[0, 0, -5]}>
         <planeGeometry args={[3.2, 1.8]} />
         <meshBasicMaterial color="#4DD0E1" transparent opacity={0.3} toneMapped={false} />
       </mesh>
    </group>
  );
}

function SceneContent() {
  const spotLightRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
      if (spotLightRef.current) {
          // Sync light intensity/color with movie flicker
          const time = state.clock.elapsedTime;
          const flicker = 1.5 + Math.sin(time * 10) * 0.5;
          spotLightRef.current.intensity = flicker;
          
          const r = 0.5 + Math.sin(time * 0.5) * 0.2;
          const g = 0.5 + Math.cos(time * 0.7) * 0.2;
          spotLightRef.current.color.setRGB(r, g, 0.8);
      }
  });

  return (
    <>
      {/* Dimmed ambient light */}
      <ambientLight intensity={0.15} />
      
      {/* Warm light from behind/side (not directly above) */}
      <pointLight position={[3, 2, 3]} intensity={0.4} color="#FFD54F" distance={10} />
      
      {/* Screen Glow Light (from the screen towards the couple) */}
      <SpotLight
        ref={spotLightRef}
        position={[0, 0, -4.5]}
        target-position={[0, 0, 2]}
        color="#4DD0E1"
        intensity={1.5}
        angle={1}
        penumbra={0.5}
        distance={8}
      />

      {/* Rotated Group for 45 degree angle view */}
      <group rotation={[0, Math.PI + 0.5, 0]} position={[0, -1, 0]}>
        <Couch />
        {/* Couple - Backs turned to camera (facing -Z), looking at screen */}
        <group position={[0, 0.2, 0]}>
            {/* Male with glasses */}
            <Character 
                position={[-0.45, 0, 0.2]} 
                color="#64B5F6" 
                scale={1.1} 
                hasGlasses={true} 
                rotation={[0, 0, -0.15]} 
            />
            {/* Female */}
            <Character 
                position={[0.45, 0, 0.2]} 
                color="#F06292" 
                scale={1.0} 
                rotation={[0, 0, 0.15]}
                isFemale={true} 
            />
        </group>
      </group>

      <Table />
      <ProjectorBeam />
    </>
  );
}

export default function LoginScene() {
  return (
    <div className="w-full h-[300px] relative">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
