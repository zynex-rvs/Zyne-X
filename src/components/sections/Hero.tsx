"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";
import { Button } from "../ui/Button";
import { Volume2, VolumeX } from "lucide-react";

interface HeroProps {
  onJoinClick: () => void;
  onExploreClick: () => void;
}

export default function Hero({ onJoinClick, onExploreClick }: HeroProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const stage = stageRef.current;
    if (!stage) return;

    let animationId: number;

    const frame = (ts: number) => {
      // smooth continuous subtle perspective tilt
      const ry = Math.sin(ts / 2000) * 4;
      const rx = Math.sin(ts / 2600) * 1.1;
      stage.style.transform = `rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;

      animationId = requestAnimationFrame(frame);
    };

    animationId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const playGlitchSound = () => {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Digital static / Zap sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200 + Math.random() * 600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02); // 0.05 max volume
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  };

  const scheduleGlitches = () => {
    if (!isSoundEnabled) return;
    // 12000ms total animation cycle. Sync with glitch keyframes in CSS
    setTimeout(playGlitchSound, 1920); // 16% mark (micro glitch A)
    setTimeout(playGlitchSound, 3696); // 30.8% mark (transition A->B)
    setTimeout(playGlitchSound, 5916); // 49.3% mark (micro glitch B)
    setTimeout(playGlitchSound, 7692); // 64.1% mark (transition B->C)
    setTimeout(playGlitchSound, 9912); // 82.6% mark (micro glitch C)
    setTimeout(playGlitchSound, 11700); // 97.5% mark (transition C->A)
  };

  return (
    <section className={styles.hero}>
      {/* Audio Toggle */}
      <button
        onClick={() => setIsSoundEnabled(!isSoundEnabled)}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10 hover:border-cyan-500/50 backdrop-blur-md transition-all duration-300"
        title={isSoundEnabled ? "Mute Glitch Sound" : "Enable Glitch Sound"}
      >
        {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-50" />}
      </button>

      <div className={styles.noise}></div>
      <div className={styles.grid}></div>
      <div className={styles.stageWrap}>
        <div className={styles.stage} ref={stageRef}>
          <div className={`${styles.logoSlot} ${styles.a}`}>
            <img
              className={styles.logo}
              src="/zynex-logo.png"
              alt="ZYNE-X"
              onAnimationStart={scheduleGlitches}
              onAnimationIteration={scheduleGlitches}
            />
          </div>

          <div className={`${styles.logoSlot} ${styles.b}`}>
            <img className={styles.logo} src="/nexaura-logo.png" alt="NexAura" />
          </div>

          <div className={`${styles.logoSlot} ${styles.c}`}>
            <img className={styles.logo} src="/rivals-logo.png" alt="RIVALS — Dept. of Artificial Intelligence and Machine Learning" />
          </div>
        </div>

        <div className={styles.reflection} aria-hidden="true">
          <div className={`${styles.logoSlot} ${styles.a}`}>
            <img className={styles.logo} src="/zynex-logo.png" alt="" />
          </div>
          <div className={`${styles.logoSlot} ${styles.b}`}>
            <img className={styles.logo} src="/nexaura-logo.png" alt="" />
          </div>
          <div className={`${styles.logoSlot} ${styles.c}`}>
            <img className={styles.logo} src="/rivals-logo.png" alt="" />
          </div>
        </div>

      </div>

      <div className={styles.caption}>
        <div className="flex flex-col items-center gap-1 mb-6">
          <p className={styles.tagline}>DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE</p>
          <p className={styles.tagline}>DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING</p>
        </div>
        <div className={styles.actions}>
          <Button onClick={onJoinClick}>
            Join Community
          </Button>
          <Button variant="cyan" onClick={onExploreClick}>
            Explore Events
          </Button>
        </div>
      </div>
    </section>
  );
}
