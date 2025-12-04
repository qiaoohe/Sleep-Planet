
import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { SleepRecord } from '../types';

// Helper to distribute points on a sphere (Fibonacci Sphere)
const getPositionOnSphere = (index: number, total: number, radius: number) => {
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  const theta = Math.PI * (1 + 5**0.5) * (index + 0.5);
  
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

// Colors matching the legend
const COLORS = {
  Complete: '#1D4ED8', // Blue-700
  Incomplete: '#7C3AED', // Violet-600
  Missed: '#1e293b'  // Slate-800
};

interface ParticleInstanceProps {
  position: THREE.Vector3;
  record: SleepRecord;
  onSelect: (record: SleepRecord) => void;
}

const ParticleInstance: React.FC<ParticleInstanceProps> = ({ position, record, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  
  // Determine color based on status
  let color = COLORS.Missed;
  if (record.status === 'complete') color = COLORS.Complete;
  else if (record.status === 'incomplete') color = COLORS.Incomplete;
  
  // All particles are interactive now to support "Add Record"
  const isInteractive = true;
  
  // Simple hover scale effect
  const scale = hovered ? 1.8 : 1.0;

  return (
    <Instance
      position={position}
      scale={scale}
      color={hovered ? '#ffffff' : color}
      onClick={(e) => {
        e.stopPropagation();
        if (isInteractive) {
           document.body.style.cursor = 'auto';
           onSelect(record);
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (isInteractive) {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    />
  );
};

interface PlanetProps {
  data: SleepRecord[];
  onRecordClick: (record: SleepRecord) => void;
}

const PlanetScene: React.FC<PlanetProps> = ({ data, onRecordClick }) => {
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // Rotate the tech core for visual effect
    if (coreRef.current) {
      coreRef.current.rotation.y -= 0.1 * delta;
      coreRef.current.rotation.z += 0.05 * delta;
    }
  });

  const particles = useMemo(() => {
    return data.map((record, i) => ({
      record,
      position: getPositionOnSphere(i, data.length, 4.5)
    }));
  }, [data]);

  return (
    <group>
        {/* Holographic Tech Core */}
        <mesh ref={coreRef} scale={[4.2, 4.2, 4.2]}>
          <icosahedronGeometry args={[1, 2]} />
          <meshBasicMaterial 
            color="#1e293b" 
            wireframe 
            transparent 
            opacity={0.15} 
          />
        </mesh>

        {/* Instanced 3D Spheres for Particles */}
        <Instances range={particles.length}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial toneMapped={false} />

          {particles.map((p) => (
            <ParticleInstance 
              key={p.record.id}
              position={p.position}
              record={p.record}
              onSelect={onRecordClick}
            />
          ))}
        </Instances>
    </group>
  );
};

interface PlanetViewProps {
  data: SleepRecord[];
  onRecordSelect: (record: SleepRecord) => void;
}

const PlanetView: React.FC<PlanetViewProps> = ({ data, onRecordSelect }) => {
  return (
    <div className="w-full h-screen bg-[#0B0D17] relative">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-900/10 blur-[60px] md:blur-[100px] rounded-full pointer-events-none" />

      <Canvas 
        camera={{ position: [0, 0, 16], fov: 50 }}
        dpr={[1, 2]} 
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#1D4ED8" />
        <directionalLight position={[-10, -5, -5]} intensity={0.5} color="#7C3AED" />
        
        <Stars radius={80} depth={50} count={6000} factor={4} saturation={0} fade speed={0.5} />
        
        <PlanetScene 
          data={data} 
          onRecordClick={onRecordSelect}
        />
        
        <OrbitControls 
          makeDefault
          enablePan={false} 
          enableZoom={true}
          minDistance={6}
          maxDistance={25}
          autoRotate={true}
          autoRotateSpeed={0.25}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
};

export default PlanetView;
