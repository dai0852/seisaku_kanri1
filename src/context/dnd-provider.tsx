"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

// Custom hook to detect if the device is a touch device
const useIsTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const onTouchStart = () => {
      setIsTouch(true);
      window.removeEventListener('touchstart', onTouchStart);
    };
    window.addEventListener('touchstart', onTouchStart, { once: true });
    return () => window.removeEventListener('touchstart', onTouchStart);
  }, []);
  return isTouch;
};

export const DndWrapper = ({ children }: { children: ReactNode }) => {
  const isTouchDevice = useIsTouchDevice();
  const backend = isTouchDevice ? TouchBackend : HTML5Backend;

  return (
    <DndProvider backend={backend} options={{ enableMouseEvents: !isTouchDevice }}>
      {children}
    </DndProvider>
  );
};
