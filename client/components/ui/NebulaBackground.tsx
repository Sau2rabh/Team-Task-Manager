import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const NebulaBackground = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Primary Nebula Blobs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-1000 ${
          isDark ? 'bg-indigo-600/20' : 'bg-indigo-500/30'
        }`}
      />
      
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 120, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`absolute top-[20%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[120px] transition-colors duration-1000 ${
          isDark ? 'bg-purple-600/20' : 'bg-purple-500/30'
        }`}
      />

      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-1000 ${
          isDark ? 'bg-blue-600/10' : 'bg-blue-500/20'
        }`}
      />

      {/* Grid Overlay */}
      <div 
        className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')] brightness-100 contrast-150 transition-opacity duration-1000 ${
          isDark ? 'opacity-20' : 'opacity-10'
        }`}
        style={{ backgroundSize: '200px' }}
      />
      
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/20 to-background/80" />
    </div>
  );
};

export default NebulaBackground;
