import { memo, useCallback } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ObjectIcon } from './svg/ObjectIcon';
import { CHARACTER_SVGS } from './svg/Characters';
import { CATEGORY_COLOR } from '../data/objects';
import { CHARACTERS } from '../data/characters';
import type { EngineObj, GameEngine } from '../hooks/useGameLoop';
import { objDragId } from '../hooks/useDragObject';
import s from './GameObject.module.css';

interface CardProps {
  obj: EngineObj;
  selected?: boolean;
  lifted?: boolean;
  shake?: boolean;
}

function fillFor(obj: EngineObj) {
  if (obj.kind === 'shadow') return '#2a1f45';
  if (obj.kind === 'question') return '#a86bff';
  return CATEGORY_COLOR[obj.def.cat];
}

/** Визуал объекта — используется и на ленте, и в DragOverlay. */
export const ObjectCard = memo(function ObjectCard({ obj, selected, lifted, shake }: CardProps) {
  if (obj.kind === 'character' && obj.characterId) {
    const Char = CHARACTER_SVGS[obj.characterId];
    return (
      <div className={`${s.card} ${s.character}`}>
        <Char size={76} />
        <span className={s.charName}>{CHARACTERS[obj.characterId].name}</span>
      </div>
    );
  }
  const cls = [
    s.card,
    obj.kind === 'shadow' && s.shadow,
    obj.kind === 'question' && s.question,
    obj.isVoid && s.void,
    selected && s.selected,
    lifted && s.lifted,
    shake && s.shake,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls} style={{ '--obj-fill': fillFor(obj) } as CSSProperties}>
      <span className={s.icon}>
        <ObjectIcon id={obj.def.id} size={40} />
      </span>
      <span className={s.label}>{obj.def.name}</span>
    </div>
  );
});

interface Props {
  obj: EngineObj;
  engine: GameEngine;
  selected: boolean;
  dragging: boolean;
  canDrag: boolean;
  shake: boolean;
  onPress: (obj: EngineObj) => void;
}

/** Объект на ленте: позицию по X пишет движок напрямую в style.transform. */
export const GameObject = memo(function GameObject({ obj, engine, selected, dragging, canDrag, shake, onPress }: Props) {
  const { setNodeRef, listeners, attributes } = useDraggable({ id: objDragId(obj.id), disabled: !canDrag });

  const slotRef = useCallback((el: HTMLDivElement | null) => engine.registerEl(obj.id, el), [engine, obj.id]);

  const handleDown = (e: PointerEvent<HTMLDivElement>) => {
    listeners?.onPointerDown?.(e);
    onPress(obj);
  };

  return (
    <div ref={slotRef} data-obj={obj.id} className={`${s.slot} ${dragging ? s.ghosted : ''}`}>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onPointerDown={handleDown}
        className={s.hit}
        role="button"
        aria-label={obj.kind === 'character' ? 'Персонаж' : obj.def.name}
      >
        <ObjectCard obj={obj} selected={selected} shake={shake} />
      </div>
    </div>
  );
});
