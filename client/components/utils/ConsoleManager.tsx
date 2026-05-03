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
      'Hydration failed because the initial UI does not match'
    ];

    console.warn = (...args) => {
      if (args[0] && typeof args[0] === 'string' && ignoredWarnings.some(w => args[0].includes(w))) {
        return;
      }
      originalWarn(...args);
    };

    // Also suppress some common hydration errors that are harmless in dev
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && ignoredWarnings.some(w => args[0].includes(w))) {
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
