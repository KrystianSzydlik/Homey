'use client';

import { useLayoutEffect, useState, useRef } from 'react';
import type { Position, UsePopoverPositionOptions, PopoverAlign, PopoverSide } from './types';

function calculatePositionFromRefs(
  triggerRef: React.RefObject<HTMLButtonElement | null>,
  contentRef: React.RefObject<HTMLDivElement | null>,
  align: PopoverAlign,
  side: PopoverSide,
  sideOffset: number
): Position | null {
  if (!triggerRef.current || !contentRef.current) return null;

  const triggerRect = triggerRef.current.getBoundingClientRect();
  const contentRect = contentRef.current.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = 0;
  let left = 0;

  // Calculate position based on side
  switch (side) {
    case 'top':
      top = triggerRect.top - contentRect.height - sideOffset;
      break;
    case 'bottom':
      top = triggerRect.bottom + sideOffset;
      break;
    case 'left':
      left = triggerRect.left - contentRect.width - sideOffset;
      top = triggerRect.top;
      break;
    case 'right':
      left = triggerRect.right + sideOffset;
      top = triggerRect.top;
      break;
  }

  // Calculate horizontal alignment for top/bottom sides
  if (side === 'top' || side === 'bottom') {
    switch (align) {
      case 'start':
        left = triggerRect.left;
        break;
      case 'center':
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'end':
        left = triggerRect.right - contentRect.width;
        break;
    }
  }

  // Calculate vertical alignment for left/right sides
  if (side === 'left' || side === 'right') {
    switch (align) {
      case 'start':
        top = triggerRect.top;
        break;
      case 'center':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        break;
      case 'end':
        top = triggerRect.bottom - contentRect.height;
        break;
    }
  }

  // Viewport boundary corrections
  if (left + contentRect.width > viewportWidth) {
    left = viewportWidth - contentRect.width - 8;
  }
  if (left < 8) {
    left = 8;
  }
  if (top + contentRect.height > viewportHeight) {
    if (side === 'bottom' && triggerRect.top > viewportHeight / 2) {
      top = triggerRect.top - contentRect.height - sideOffset;
    } else {
      top = viewportHeight - contentRect.height - 8;
    }
  }
  if (top < 8) {
    if (side === 'top' && triggerRect.bottom < viewportHeight / 2) {
      top = triggerRect.bottom + sideOffset;
    } else {
      top = 8;
    }
  }

  return { top, left };
}

export function usePopoverPosition({
  triggerRef,
  contentRef,
  isOpen,
  align,
  side,
  sideOffset,
}: UsePopoverPositionOptions): Position {
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const positionRef = useRef<Position>({ top: 0, left: 0 });

  // Use useLayoutEffect for synchronous DOM measurements before paint
  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const newPosition = calculatePositionFromRefs(
        triggerRef,
        contentRef,
        align,
        side,
        sideOffset
      );
      if (newPosition) {
        positionRef.current = newPosition;
        setPosition(newPosition);
      }
    };

    // Initial calculation - use requestAnimationFrame to batch with browser paint
    requestAnimationFrame(updatePosition);

    // Subscribe to scroll and resize events
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, triggerRef, contentRef, align, side, sideOffset]);

  return position;
}
