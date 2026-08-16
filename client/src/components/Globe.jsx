import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Globe - Animated wireframe globe with neon glow effect
 * Uses custom geometry for better performance than MeshDistortMaterial
 */
export default function Globe() {
  const groupRef = useRef();
  const wireRef = useRef();
  const glowRef = useRef();

  // Create sphere geometry
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);

  // Create wireframe geometry
  const wireGeometry = useMemo(() => new THREE.WireframeGeometry(
    new THREE.SphereGeometry(1.01, 24, 24)
  ), []);

  // Create dot geometry for latitude/longitude intersections
  const dotsGeometry = useMemo(() => {
    const positions = [];
    const latLines = 12;
    const lonLines = 24;

    for (let lat = 0; lat <= latLines; lat++) {
      const phi = (lat / latLines) * Math.PI;
      for (let lon = 0; lon <= lonLines; lon++) {
        const theta = (lon / lonLines) * 2 * Math.PI;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        positions.push(x * 1.02, y * 1.02, z * 1.02);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    }
    // Pulsing glow
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.05 + Math.sin(t * 1.5) * 0.03;
    }
  });

  return (
    <group ref={groupRef} scale={1.8}>
      {/* Solid sphere (very transparent) */}
      <mesh ref={glowRef} geometry={geometry}>
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Wireframe */}
      <lineSegments ref={wireRef} geometry={wireGeometry}>
        <lineBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.3}
          linewidth={1}
        />
      </lineSegments>

      {/* Intersection dots */}
      <points geometry={dotsGeometry}>
        <pointsMaterial
          color="#00f0ff"
          size={0.025}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Inner glow sphere */}
      <mesh geometry={geometry} scale={0.98}>
        <meshBasicMaterial
          color="#7000ff"
          transparent
          opacity={0.03}
        />
      </mesh>

      {/* Equator ring highlight */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.01, 0.003, 8, 64]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
