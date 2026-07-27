"use client";

import React, { useRef, useEffect, useState } from "react";

interface SectionCardProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export default function SectionCard({ children, id, className = "" }: SectionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <section id={id} className={`relative py-6 md:py-8 ${className}`}>
      <div className="w-full">
        <div 
          id={id} 
          ref={cardRef} 
          className={`group/card relative rounded-[2rem] neumorphic-raised transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'}`}
        >

          {/* Content */}
          <div className="relative z-10 p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
