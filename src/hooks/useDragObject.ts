import { useCallback, useState } from 'react';
import { PointerSensor, pointerWithin, rectIntersection, useSensor, useSensors } from '@dnd-kit/core';
import type { CollisionDetection, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { GameEngine } from './useGameLoop';

/** Ищем контейнер под пальцем; если палец между ними — по пересечению прямоугольников. */
const collision: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length ? hits : rectIntersection(args);
};

export const binDropId = (i: number) => `bin-${i}`;
export const objDragId = (id: number) => `obj-${id}`;

/**
 * Drag-and-drop объектов через @dnd-kit.
 * PointerSensor работает и с тачем, и с мышью; порог 6px отделяет тап (выбор) от перетаскивания.
 */
export function useDragObject(engine: GameEngine | null, onSorted?: (id: number) => void) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragStart = useCallback(
    (e: DragStartEvent) => {
      const id = Number(String(e.active.id).slice(4));
      engine?.hold(id, true);
      setActiveId(id);
    },
    [engine],
  );

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      const id = Number(String(e.active.id).slice(4));
      setActiveId(null);
      const over = e.over?.id ? String(e.over.id) : null;
      if (engine && over?.startsWith('bin-')) {
        const ok = engine.sort(id, Number(over.slice(4)));
        if (ok) onSorted?.(id);
        else engine.hold(id, false);
      } else {
        engine?.hold(id, false);
      }
    },
    [engine, onSorted],
  );

  const onDragCancel = useCallback(() => {
    if (activeId !== null) engine?.hold(activeId, false);
    setActiveId(null);
  }, [engine, activeId]);

  return { sensors, activeId, onDragStart, onDragEnd, onDragCancel, collisionDetection: collision };
}
