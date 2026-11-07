'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const CONFETTI_COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
}

export function ConfettiBurst() {
  const shouldReduceMotion = useReducedMotion();
  const [particles] = useState<Particle[]>(() => {
    return Array.from({ length: 40 }).map((_, i) => {
      const angle = (i / 40) * 2 * Math.PI;
      const distance = 160 + Math.random() * 240;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance + 60,
        rotation: Math.random() * 720 - 360,
        scale: 0.6 + Math.random() * 0.8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.2,
      };
    });
  });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [shouldReduceMotion]);

  if (!visible || shouldReduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: p.x,
            y: p.y,
            scale: p.scale,
            rotate: p.rotation,
          }}
          transition={{
            duration: 2.2,
            delay: p.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            backgroundColor: p.color,
            width: p.id % 2 === 0 ? '10px' : '14px',
            height: p.id % 2 === 0 ? '14px' : '8px',
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
          }}
          className="absolute shadow-sm"
        />
      ))}
    </div>
  );
}
