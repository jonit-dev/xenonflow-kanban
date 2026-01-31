import { Float, PointMaterial, Points } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

function StarField() {
  const ref = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(2000 * 3);
    const col = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const cyan = new THREE.Color('#06b6d4');
      const green = new THREE.Color('#10b981');
      const mix = Math.random();
      const finalCol = cyan.lerp(green, mix * 0.3);

      col[i * 3] = finalCol.r;
      col[i * 3 + 1] = finalCol.g;
      col[i * 3 + 2] = finalCol.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.0005;
      ref.current.rotation.x += 0.0002;
    }
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function MotherOrb() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.1;
      mesh.current.rotation.z = t * 0.05;
      mesh.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={mesh} position={[10, 5, -10]}>
        <icosahedronGeometry args={[4, 15]} />
        <meshStandardMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.15}
          emissive="#06b6d4"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

function GridFloor() {
  return (
    <gridHelper
      args={[100, 50, '#164e63', '#083344']}
      position={[0, -10, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

export const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#020617]">
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
        <StarField />
        <MotherOrb />
        <GridFloor />
      </Canvas>
    </div>
  );
};
