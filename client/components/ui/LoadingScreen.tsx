"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = ({ onFinished }: { onFinished?: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Random increments to make it feel "real"
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 100);
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  // Separate effect to handle completion callback safely
  useEffect(() => {
    if (progress >= 100 && onFinished) {
      // Small delay to let the user see 100% before transitioning
      const timeout = setTimeout(() => {
        onFinished();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, onFinished]);

  if (!mounted) return null;

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-9999 bg-background flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Progress Circle Container */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-muted/10"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 88}
              initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - progress / 100) }}
              className="text-primary"
              strokeLinecap="round"
            />
          </svg>
          
          {/* Percentage Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black tracking-tighter text-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Text Details */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-400">
            Team Task Manager
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-medium">
            Setting up your workspace...
          </p>
        </motion.div>
      </div>

      {/* Glassy Loading Bar at Bottom */}
      <div className="absolute bottom-12 w-64 h-1.5 bg-muted/20 rounded-full overflow-hidden border border-border/50">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
