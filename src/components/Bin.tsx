import { memo } from 'react';
import type { CSSProperties } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { BinSVG } from './svg/BinSVG';
import { Icon } from './svg/Icons';
import { CATEGORY_COLOR, CATEGORY_LABEL } from '../data/objects';
import type { Category } from '../data/types';
import { binDropId } from '../hooks/useDragObject';
import s from './Bin.module.css';

export interface BinFlash {
  ok: boolean;
  key: number;
}

interface Props {
  index: number;
  cat: Category;
  armed: boolean;
  locked: boolean;
  trap: boolean;
  hint: boolean;
  flash: BinFlash | null;
  onPress: (index: number) => void;
}

export const Bin = memo(function Bin({ index, cat, armed, locked, trap, hint, flash, onPress }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: binDropId(index) });
  const color = CATEGORY_COLOR[cat];
  const cls = [s.bin, armed && s.armed, isOver && s.over, locked && s.locked, trap && s.trap, hint && s.hint]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={setNodeRef}
      className={cls}
      style={{ '--bin-color': color } as CSSProperties}
      onPointerDown={() => onPress(index)}
      role="button"
      aria-label={`Контейнер ${CATEGORY_LABEL[cat]}`}
    >
      <BinSVG color={color} className={s.svg} />
      <span className={s.label}>
        {locked && <Icon name="lock" size={12} />}
        {CATEGORY_LABEL[cat]}
      </span>
      {trap && <span className={s.tag}>ПРИКАЗ</span>}
      {hint && <span className={s.hintRing} aria-hidden />}
      <AnimatePresence>
        {flash && (
          <motion.span
            key={flash.key}
            className={`${s.flash} ${flash.ok ? s.ok : s.bad}`}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
});
