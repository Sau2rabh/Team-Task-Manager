"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ onComplete }) => {
  const particles = Array.from({ length: 50 });
  const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc'];

  return (
    <div className="fixed inset-0 pointer-events-none z-100 overflow-hidden">
      {particles.map((_, i) => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const x = Math.random() * 100; // start x position (percent)
        const delay = Math.random() * 0.5;
        const duration = 1.5 + Math.random() * 2;
        const size = 5 + Math.random() * 10;
        
        return (
          <motion.div
            key={i}
            initial={{ 
              opacity: 1, 
              x: `${x}vw`, 
              y: '-10px',
              rotate: 0,
              scale: 0 
            }}
            animate={{ 
              opacity: 0,
              y: '100vh',
              x: `${x + (Math.random() * 20 - 10)}vw`,
              rotate: 360 * 2,
              scale: 1 
            }}
            transition={{ 
              duration, 
              delay,
              ease: "easeOut" 
            }}
            className="absolute rounded-sm"
            style={{ 
              backgroundColor: color,
              width: size,
              height: size,
            }}
          />
        );
      })}
    </div>
  );
};
