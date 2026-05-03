"use client";

import { useEffect } from 'react';

export default function ConsoleManager() {
  useEffect(() => {
    // Suppress annoying browser/library warnings globally
    const originalWarn = console.warn;
    const originalError = console.error;

    const ignoredWarnings = [
      'The width(-1) and height(-1) of chart should be greater than 0',
      'was preloaded using link preload but not used within a few seconds',
      'Extra attributes from the server',
      'Hydration failed because the initial UI does not match',
      'Minified React error #418',
      'Minified React error #423',
      'preloaded using link preload but not used'
    ];

    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      if (ignoredWarnings.some(w => message.includes(w))) {
        return;
      }
      originalWarn(...args);
    };

    // Also suppress some common hydration errors that are harmless in dev
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      if (ignoredWarnings.some(w => message.includes(w))) {
        return;
      }
      originalError(...args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return null;
}
