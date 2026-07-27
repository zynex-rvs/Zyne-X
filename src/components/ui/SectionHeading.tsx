"use client";

import { useRef, useEffect, useState } from "react";

interface SectionHeadingProps {
  title: string;
}

export default function SectionHeading({ title }: SectionHeadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Continuous 3D floating animation
  useEffect(() => {
    if (!headingRef.current) return;
    let animId: number;
    const el = headingRef.current;

    const animate = (time: number) => {
      const rx = Math.sin(time / 2000) * 8;
      const ry = Math.sin(time / 2500) * 12;
      const tz = Math.sin(time / 3000) * 10;
      el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${tz}px)`;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center mb-16 w-full overflow-visible">
      
      {/* Decorative top accent — minimal single dot and line */}
      <div className={`flex items-center gap-3 mb-6 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/20" />
        <span className="text-[10px] font-sans font-medium tracking-[0.4em] uppercase text-neutral-400">
          {title}
        </span>
        <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white/20" />
      </div>

      {/* Main heading text with minimal 3D float + silver gradient */}
      <h2
        ref={headingRef}
        className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl px-2 text-center font-heading font-bold tracking-tight uppercase leading-none transition-opacity duration-1000 delay-200 text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-300 to-neutral-600 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {title}
      </h2>

      {/* Bottom decorative line - ultra minimal */}
      <div className={`mt-6 flex items-center gap-2 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
}
