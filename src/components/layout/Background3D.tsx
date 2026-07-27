"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleNetwork() {
  const ref = useRef<THREE.Points>(null);
  const count = 4000;
  
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const color1 = new THREE.Color('#06b6d4'); // cyan
    const color2 = new THREE.Color('#3b82f6'); // blue
    const color3 = new THREE.Color('#a855f7'); // purple
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Generate points in a vast sphere
      const r = 25 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5; // flatten it a bit like a galaxy/network layer
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Randomly assign one of the 3 brand colors with slight variations
      const rand = Math.random();
      if (rand < 0.33) tempColor.copy(color1);
      else if (rand < 0.66) tempColor.copy(color2);
      else tempColor.copy(color3);
      
      // Add slight randomness to color
      tempColor.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);

      col[i * 3] = tempColor.r;
      col[i * 3 + 1] = tempColor.g;
      col[i * 3 + 2] = tempColor.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      // Base slow rotation
      ref.current.rotation.y -= delta * 0.05;
      
      // Subtle parallax effect based on mouse movement
      const mouseX = state.pointer.x; // -1 to 1
      const mouseY = state.pointer.y; // -1 to 1
      
      // Interpolate rotation towards mouse
      ref.current.rotation.x += (mouseY * 0.1 - ref.current.rotation.x) * 0.02;
      ref.current.rotation.z += (mouseX * 0.1 - ref.current.rotation.z) * 0.02;
    }
  });

  return (
    <group rotation={[Math.PI / 4, 0, 0]}>
      <points ref={ref} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={3}
          sizeAttenuation={false}
          transparent
          vertexColors
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
        />
      </points>
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 w-screen h-screen z-[-1] pointer-events-none" style={{ backgroundColor: '#1a1a1a' }}>
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }} dpr={[1, 2]}>
        {/* Fog to fade out particles in the distance */}
        <fog attach="fog" args={['#1a1a1a', 15, 40]} />
        <ParticleNetwork />
      </Canvas>
    </div>
  );
}
