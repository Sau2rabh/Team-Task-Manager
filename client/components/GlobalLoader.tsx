"use client";

import React, { useState } from 'react';
import LoadingScreen from './ui/LoadingScreen';

const GlobalLoader = ({ children }: { children: React.ReactNode }) => {
  const [initialLoadFinished, setInitialLoadFinished] = useState(false);

  return (
    <>
      {!initialLoadFinished && (
        <LoadingScreen onFinished={() => setInitialLoadFinished(true)} />
      )}
      <div className={initialLoadFinished ? "visible" : "invisible h-0 overflow-hidden"}>
        {children}
      </div>
    </>
  );
};

export default GlobalLoader;
