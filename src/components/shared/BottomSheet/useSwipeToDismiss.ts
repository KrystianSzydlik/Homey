'use client';

import { useState, useCallback } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';

const SWIPE_THRESHOLD = 100; // px to trigger dismiss
const SWIPE_VELOCITY_THRESHOLD = 500; // px/s

export function useSwipeToDismiss(enabled: boolean, onDismiss: () => void) {
  const [isDragging, setIsDragging] = useState(false);
  const dragY = useMotionValue(0);
  
  const opacity = useTransform(dragY, [0, SWIPE_THRESHOLD], [1, 0.5]);

  let startY = 0;
  let startTime = 0;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    startY = e.touches[0].clientY;
    startTime = Date.now();
    setIsDragging(true);
  }, [enabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || !isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    // Only allow dragging down
    if (deltaY > 0) {
      dragY.set(deltaY);
    }
  }, [enabled, isDragging, dragY]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !isDragging) return;
    
    const currentDragY = dragY.get();
    const duration = Date.now() - startTime;
    const velocity = currentDragY / duration * 1000; // px/s

    setIsDragging(false);

    // Check if should dismiss
    if (currentDragY > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      onDismiss();
    } else {
      // Snap back
      dragY.set(0);
    }
  }, [enabled, isDragging, dragY, onDismiss]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    dragY,
    opacity,
  };
}
