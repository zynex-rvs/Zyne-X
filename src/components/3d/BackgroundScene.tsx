"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Visualization from "./Visualization";

export default function BackgroundScene() {
  return (
    <div className="fixed inset-0 z-[-2] pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Visualization />
        </Suspense>
      </Canvas>
    </div>
  );
}
