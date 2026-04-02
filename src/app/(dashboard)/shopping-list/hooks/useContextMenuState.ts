import { useState, useCallback } from 'react';
import type { Position } from './useLongPress';

export interface ContextMenuState {
  isOpen: boolean;
  position: Position;
  targetId: string | null;
}

export interface UseContextMenuStateReturn {
  menuState: ContextMenuState;
  openMenu: (targetId: string, position: Position) => void;
  closeMenu: () => void;
}

export function useContextMenuState(): UseContextMenuStateReturn {
  const [menuState, setMenuState] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    targetId: null,
  });

  const openMenu = useCallback((targetId: string, position: Position) => {
    setMenuState({
      isOpen: true,
      position,
      targetId,
    });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    menuState,
    openMenu,
    closeMenu,
  };
}
