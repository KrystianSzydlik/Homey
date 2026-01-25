import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLongPress } from './useLongPress';

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call onLongPress after 500ms if no movement', async () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress }));

    const touchEvent = {
      touches: [{ clientX: 100, clientY: 200 }],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchEvent);
    });

    expect(onLongPress).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalledWith({ x: 100, y: 200 });
  });

  it('should NOT trigger if touch moves > 10px', async () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress }));

    const touchStartEvent = {
      touches: [{ clientX: 100, clientY: 200 }],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    const touchMoveEvent = {
      touches: [{ clientX: 120, clientY: 200 }], // 20px movement
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchStartEvent);
    });

    act(() => {
      vi.advanceTimersByTime(100);
      result.current.onTouchMove(touchMoveEvent);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('should cancel on touchEnd before delay', async () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress }));

    const touchEvent = {
      touches: [{ clientX: 100, clientY: 200 }],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchEvent);
    });

    act(() => {
      vi.advanceTimersByTime(300); // Before 500ms
      result.current.onTouchEnd();
    });

    act(() => {
      vi.advanceTimersByTime(300); // Total 600ms
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('should return position of touch', async () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress }));

    const touchEvent = {
      touches: [{ clientX: 150, clientY: 250 }],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchEvent);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).toHaveBeenCalledWith({ x: 150, y: 250 });
  });

  it('should use custom delay', async () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, delay: 1000 })
    );

    const touchEvent = {
      touches: [{ clientX: 100, clientY: 200 }],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchEvent);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500); // Total 1000ms
    });

    expect(onLongPress).toHaveBeenCalled();
  });

  it('should use custom threshold', async () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, threshold: 5 })
    );

    const touchStartEvent = {
      touches: [{ clientX: 100, clientY: 200 }],
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    const touchMoveEvent = {
      touches: [{ clientX: 108, clientY: 200 }], // 8px movement > 5px threshold
      preventDefault: vi.fn(),
    } as unknown as React.TouchEvent;

    act(() => {
      result.current.onTouchStart(touchStartEvent);
    });

    act(() => {
      result.current.onTouchMove(touchMoveEvent);
      vi.advanceTimersByTime(500);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('should handle context menu event', async () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress }));

    const contextMenuEvent = {
      clientX: 100,
      clientY: 200,
      preventDefault: vi.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.onContextMenu(contextMenuEvent);
    });

    expect(contextMenuEvent.preventDefault).toHaveBeenCalled();
    expect(onLongPress).toHaveBeenCalledWith({ x: 100, y: 200 });
  });
});
