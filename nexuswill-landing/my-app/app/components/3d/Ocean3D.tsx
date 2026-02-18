"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function WaveMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#0f172a") },
      uColorB: { value: new THREE.Color("#1e293b") },
      uColorC: { value: new THREE.Color("#38bdf8") },
    }),
    []
  );

  const vertexShader = `
    uniform float uTime;
    varying float vElevation;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      float elevation = sin(pos.x * 2.0 + uTime * 0.5) * 0.2;
      elevation += sin(pos.y * 1.5 + uTime * 0.3) * 0.15;
      elevation += sin((pos.x + pos.y) * 1.0 + uTime * 0.4) * 0.1;
      
      pos.z += elevation;
      vElevation = elevation;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    uniform float uTime;
    varying float vElevation;
    varying vec2 vUv;
    
    void main() {
      float mixStrength = (vElevation + 0.5) * 0.8;
      vec3 color = mix(uColorA, uColorB, mixStrength);
      
      // Add subtle cyan glow on peaks
      float glowStrength = smoothstep(0.3, 0.5, vElevation);
      color = mix(color, uColorC, glowStrength * 0.3);
      
      // Add grid-like pattern
      float gridX = step(0.98, fract(vUv.x * 50.0));
      float gridY = step(0.98, fract(vUv.y * 50.0));
      float grid = max(gridX, gridY) * 0.1;
      color += grid * uColorC;
      
      gl_FragColor = vec4(color, 0.6);
    }
  `;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[20, 20, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Cyan/blue colors
      colors[i * 3] = 0.2 + Math.random() * 0.3;
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
      colors[i * 3 + 2] = 1;
    }

    return { positions, colors };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Lightning() {
  const lightningRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lightningRef.current) {
      const material = lightningRef.current.material as THREE.MeshBasicMaterial;
      const time = state.clock.elapsedTime;
      // Random flashes
      const flash = Math.sin(time * 10) > 0.95 ? 0.8 : 0;
      material.opacity = flash * Math.random();
    }
  });

  return (
    <mesh ref={lightningRef} position={[2, 3, -5]}>
      <planeGeometry args={[0.1, 8]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0} />
    </mesh>
  );
}

export function Ocean3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 3, 8], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} color="#38bdf8" intensity={0.5} />
        
        <WaveMesh />
        <FloatingParticles />
        <Lightning />
      </Canvas>
    </div>
  );
}
