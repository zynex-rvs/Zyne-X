"use client";
/* eslint-disable react-hooks/purity */

import React, { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { PerformanceMonitor } from "@react-three/drei";

// ==========================================
// GLSL SHADER CODE: VOLUMETRIC FLAMES (RAYMARCHING)
// ==========================================

const flameVertexShader = `
varying vec2 vUv;
varying vec3 vRayOrigin;
varying vec3 vRayDirection;

uniform vec2 uResolution;
uniform float uMouseX;
uniform float uMouseY;
uniform float uScrollY;

void main() {
    vUv = uv;
    
    // Calculate ray origin and direction in clip space
    // Maps screen coordinates to a virtual 3D perspective camera frustum
    vec3 ndc = vec3(position.xy, 1.0);
    vRayOrigin = vec3(0.0, 0.0, 2.5);
    
    float aspect = uResolution.x / uResolution.y;
    // Apply camera parallax based on mouse
    vec3 targetDirection = normalize(vec3(
        position.x * aspect * 1.2 - uMouseX * 0.15,
        position.y * 1.2 - (uMouseY * 0.15) + (uScrollY * 0.0002),
        -1.5
    ));
    
    vRayDirection = targetDirection;
    gl_Position = vec4(position, 1.0);
}
`;

const flameFragmentShader = `
varying vec2 vUv;
varying vec3 vRayOrigin;
varying vec3 vRayDirection;

uniform float uTime;
uniform float uScrollY;
uniform float uPerformanceLevel; // 1.0 = High, 0.0 = Low

// --- Noise Math Helpers ---
// 3D Simplex Noise by Ashima Arts (Modified for speed and performance)
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

// Fractional Brownian Motion for complex turbulence mapping
float fbm(vec3 x, int octaves) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 6; ++i) {
        if (i >= octaves) break;
        v += a * snoise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

// Map volumetric density to realistic temperature color spectra
// Custom Blue -> Violet -> Orange gradient mapping simulating high-class plasma engine
vec3 temperatureToColor(float temp) {
    vec3 coolBg = vec3(0.02, 0.03, 0.09); // Base dark void #050816
    vec3 violet = vec3(0.28, 0.08, 0.65); // Violet flame edge
    vec3 blue   = vec3(0.05, 0.45, 0.95); // Deep hot blue
    vec3 orange = vec3(0.95, 0.55, 0.10); // Hyper-combustion orange highlights
    vec3 white  = vec3(1.0, 1.0, 1.0);    // Core hot combustion point

    // Blend paths
    vec3 col = mix(coolBg, violet, smoothstep(0.05, 0.35, temp));
    col = mix(col, blue, smoothstep(0.35, 0.65, temp));
    col = mix(col, orange, smoothstep(0.65, 0.88, temp));
    col = mix(col, white, smoothstep(0.88, 1.0, temp));
    
    return col;
}

// Evaluate flame density field at a given 3D position
float getDensity(vec3 p) {
    float scrollOffset = uScrollY * 0.0015;
    float pulse = 1.0 + sin(uTime * 0.7) * 0.08;
    
    // Upward flow + noise perturbation
    vec3 noisePos = p * vec3(1.6, 1.0, 1.6) - vec3(0.0, uTime * 1.8 * pulse + scrollOffset, 0.0);
    
    // Domain warping (noise perturbing noise) for ultra-realistic flame licking behavior
    int octaves = (uPerformanceLevel > 0.5) ? 4 : 2;
    vec3 warp = vec3(
        fbm(noisePos + vec3(0.0, 0.0, 0.0), octaves),
        fbm(noisePos + vec3(5.2, 1.3, 2.8), octaves),
        fbm(noisePos + vec3(1.8, 4.7, 9.1), octaves)
    );
    
    // Primary turbulence sample
    float density = fbm(noisePos + warp * 1.6, octaves);
    
    // Volume constraints (keep flame at the bottom and center)
    float heightFade = smoothstep(1.5, -2.5, p.y); // Rises from bottom, fades upwards
    float widthFade = smoothstep(1.8, 0.0, length(p.xz)); // Cylindrical containment
    
    return max(0.0, density * heightFade * widthFade * 1.8 - (p.y + 1.0) * 0.45);
}

void main() {
    vec3 ro = vRayOrigin;
    vec3 rd = normalize(vRayDirection);
    
    // Determine Raymarching Step parameters based on performance level
    int numSteps = (uPerformanceLevel > 0.5) ? 48 : 24;
    float maxDist = 6.0;
    float stepSize = maxDist / float(numSteps);
    
    float totalT = 0.0;
    vec3 accumulatedColor = vec3(0.0);
    float accumulatedAlpha = 0.0;
    
    // Jitter steps slightly to prevent banding artifacts (dithering)
    float jitter = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) * 0.05;
    totalT += jitter;

    // Volumetric Raymarching Loop
    for (int i = 0; i < 48; i++) {
        if (i >= numSteps || accumulatedAlpha >= 0.95) break;
        
        vec3 p = ro + rd * totalT;
        float density = getDensity(p);
        
        if (density > 0.01) {
            vec3 stepColor = temperatureToColor(density);
            // Beer-Lambert law approximation for absorption
            float alpha = density * stepSize * 2.2;
            
            accumulatedColor += stepColor * alpha * (1.0 - accumulatedAlpha);
            accumulatedAlpha += alpha * (1.0 - accumulatedAlpha);
        }
        
        totalT += stepSize;
    }
    
    // Final blend with dark futuristic screen space background
    vec3 finalBg = vec3(0.02, 0.03, 0.09); // #050816
    vec3 finalColor = mix(finalBg, accumulatedColor, accumulatedAlpha);
    
    // Dynamic overlay check for readability
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

// ==========================================
// GLSL SHADER CODE: GLOWING EMBERS (PARTICLES)
// ==========================================

const emberVertexShader = `
uniform float uTime;
varying float vFade;

void main() {
    vec3 pos = position;
    
    // Create animated particle drift directly inside the vertex shader
    // Using simple procedural sine-noise physics
    float phase = pos.x * 12.0 + pos.z * 5.0;
    pos.y += uTime * (0.35 + sin(phase) * 0.15);
    pos.x += sin(pos.y * 3.0 + uTime + phase) * 0.08;
    pos.z += cos(pos.y * 2.0 + uTime * 0.8 + phase) * 0.08;
    
    // Wrap boundaries in vertex space
    pos.y = mod(pos.y + 2.0, 4.0) - 2.0;
    pos.x = mod(pos.x + 2.0, 4.0) - 2.0;
    
    // Calculate fade based on height
    vFade = smoothstep(1.8, -1.0, pos.y) * smoothstep(-2.0, -1.5, pos.y);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation (scale down based on distance)
    gl_PointSize = (15.0 / -mvPosition.z) * (0.8 + sin(uTime * 2.0 + phase) * 0.2);
}
`;

const emberFragmentShader = `
varying float vFade;

void main() {
    // Generate circular shape with soft radial glow
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    if (dist > 0.5) discard;
    
    // Soft radial falloff
    float glow = smoothstep(0.5, 0.0, dist);
    
    // Ultra-bright orange/cyan spark blend
    vec3 col = vec3(1.0, 0.45, 0.15) * glow * vFade * 2.0;
    
    gl_FragColor = vec4(col, glow * vFade * 0.8);
}
`;

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function Visualization() {
  const flameMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const emberMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const embersGeometryRef = useRef<THREE.BufferGeometry>(null);
  
  const { mouse, size } = useThree();
  
  // Adaptive rendering configuration states
  const [performanceLevel, setPerformanceLevel] = useState(1.0); // 1 = High, 0 = Low
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Set up listeners for page state / user preferences
  useEffect(() => {
    // Visibility state detection for tab pausing
    const handleVisibility = () => setIsPaused(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", handleVisibility);

    // Reduced motion accessibility check
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Instanced geometry arrays for embers
  const emberCount = performanceLevel > 0.5 ? 400 : 150;
  const emberPositions = useMemo(() => {
    const arr = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4.0;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 1.5 - 0.5;
    }
    return arr;
  }, [emberCount]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uScrollY: { value: 0 },
    uMouseX: { value: 0 },
    uMouseY: { value: 0 },
    uPerformanceLevel: { value: 1.0 }
  }), []);

  useFrame((state, delta) => {
    if (isPaused || reducedMotion) return;

    const time = state.clock.getElapsedTime();

    // Sync flame uniforms
    if (flameMaterialRef.current) {
      flameMaterialRef.current.uniforms.uTime.value = time;
      flameMaterialRef.current.uniforms.uResolution.value.set(size.width, size.height);
      flameMaterialRef.current.uniforms.uScrollY.value = window.scrollY;
      flameMaterialRef.current.uniforms.uPerformanceLevel.value = performanceLevel;
      
      // Interpolate mouse coordinates smoothly for parallax offsets
      flameMaterialRef.current.uniforms.uMouseX.value = THREE.MathUtils.lerp(
        flameMaterialRef.current.uniforms.uMouseX.value,
        mouse.x,
        0.04
      );
      flameMaterialRef.current.uniforms.uMouseY.value = THREE.MathUtils.lerp(
        flameMaterialRef.current.uniforms.uMouseY.value,
        mouse.y,
        0.04
      );
    }

    // Sync embers uniforms
    if (emberMaterialRef.current) {
      emberMaterialRef.current.uniforms.uTime.value = time;
    }
  });

  // Graceful fallback for reduced motion preference
  if (reducedMotion) {
    return (
      <mesh>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#050816" />
      </mesh>
    );
  }

  return (
    <>
      {/* Performance monitor automatically scales complexity to keep 60 FPS */}
      <PerformanceMonitor
        onDecline={() => setPerformanceLevel(0.0)}
        onIncline={() => setPerformanceLevel(1.0)}
      />

      {/* Volumetric Raymarching Flame Quad */}
      <mesh>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={flameMaterialRef}
          vertexShader={flameVertexShader}
          fragmentShader={flameFragmentShader}
          uniforms={uniforms}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Dynamic Glowing Embers */}
      <points>
        <bufferGeometry ref={embersGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            count={emberCount}
            array={emberPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={emberMaterialRef}
          vertexShader={emberVertexShader}
          fragmentShader={emberFragmentShader}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Bloom layer to bleed core light values */}
      {performanceLevel > 0.5 && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.4}
            luminanceSmoothing={0.3}
            intensity={1.5}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </>
  );
}
