import {
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface DndSensorOptions {
  mouseDistance?: number;
  touchDelay?: number;
  touchTolerance?: number;
}

const DEFAULT_OPTIONS: Required<DndSensorOptions> = {
  mouseDistance: 10,
  touchDelay: 150,
  touchTolerance: 8,
};

export function useDndSensors(options: DndSensorOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: config.mouseDistance,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: config.touchDelay,
        tolerance: config.touchTolerance,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
}
