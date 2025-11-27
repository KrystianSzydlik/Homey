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

function Character({ position, color, scale = 1, hasGlasses = false, rotation = [0, 0, 0] }: { position: [number, number, number], color: string, scale?: number, hasGlasses?: boolean, rotation?: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      // Subtle breathing animation
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.02;
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
  return (
    <group position={[0, 0.15, 2]} rotation={[0, 0, 0]}>
       {/* The Projector Unit (Square on table) */}
       <RoundedBox args={[0.4, 0.2, 0.4]} radius={0.02} position={[0, 0, 0]}>
         <meshStandardMaterial color="#212121" roughness={0.5} />
       </RoundedBox>
       
       {/* The Beam Cone - projecting forward (negative Z) */}
       <mesh position={[0, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]}>
         <coneGeometry args={[1.8, 5, 32, 1, true]} />
         <meshBasicMaterial color="#E0F7FA" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
       </mesh>

       {/* The Screen (Projected Image) */}
       <mesh position={[0, 0, -5]}>
         <planeGeometry args={[3.2, 1.8]} />
         <meshBasicMaterial color="#4DD0E1" transparent opacity={0.3} toneMapped={false} />
       </mesh>
    </group>
  );
}

function SceneContent() {
  return (
    <>
      {/* Dimmed ambient light */}
      <ambientLight intensity={0.15} />
      
      {/* Warm light from behind/side (not directly above) */}
      <pointLight position={[3, 2, 3]} intensity={0.4} color="#FFD54F" distance={10} />
      
      {/* Screen Glow Light (from the screen towards the couple) */}
      <SpotLight
        position={[0, 0, -4.5]}
        target-position={[0, 0, 2]}
        color="#4DD0E1"
        intensity={1.5}
        angle={1}
        penumbra={0.5}
        distance={8}
      />

      <group rotation={[0, Math.PI, 0]} position={[0, -1, 0]}>
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
