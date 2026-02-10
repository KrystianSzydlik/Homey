'use client';

import { useState, useCallback, useRef } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';

const SWIPE_THRESHOLD = 100; // px to trigger dismiss
const SWIPE_VELOCITY_THRESHOLD = 500; // px/s

export function useSwipeToDismiss(enabled: boolean, onDismiss: () => void) {
  const [isDragging, setIsDragging] = useState(false);
  const dragY = useMotionValue(0);

  // Use refs to store mutable values that persist across renders
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);

  const opacity = useTransform(dragY, [0, SWIPE_THRESHOLD], [1, 0.5]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      startYRef.current = e.touches[0].clientY;
      startTimeRef.current = Date.now();
      setIsDragging(true);
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !isDragging) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // Only allow dragging down
      if (deltaY > 0) {
        dragY.set(deltaY);
      }
    },
    [enabled, isDragging, dragY]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !isDragging) return;

    const currentDragY = dragY.get();
    const duration = Date.now() - startTimeRef.current;
    const velocity = duration > 0 ? (currentDragY / duration) * 1000 : 0; // px/s

    setIsDragging(false);

    // Check if should dismiss
    if (currentDragY > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      onDismiss();
    } else {
      // Snap back with animation
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
