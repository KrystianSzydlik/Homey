import { useRef, useCallback } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface UseLongPressOptions {
  onLongPress: (position: Position) => void;
  delay?: number;
  threshold?: number;
}

export interface UseLongPressHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function useLongPress({
  onLongPress,
  delay = 500,
  threshold = 10,
}: UseLongPressOptions): UseLongPressHandlers {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPositionRef = useRef<Position | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const position = { x: touch.clientX, y: touch.clientY };
      startPositionRef.current = position;
      isLongPressTriggeredRef.current = false;

      clearTimer();
      timerRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        onLongPress(position);
      }, delay);
    },
    [onLongPress, delay, clearTimer]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!startPositionRef.current) return;

      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - startPositionRef.current.x);
      const deltaY = Math.abs(touch.clientY - startPositionRef.current.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > threshold) {
        clearTimer();
      }
    },
    [threshold, clearTimer]
  );

  const onTouchEnd = useCallback(() => {
    clearTimer();
    startPositionRef.current = null;
  }, [clearTimer]);

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onLongPress({ x: e.clientX, y: e.clientY });
    },
    [onLongPress]
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onContextMenu,
  };
}
