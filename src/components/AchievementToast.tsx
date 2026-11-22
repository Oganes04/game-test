import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from './svg/Icons';
import { useUiStore } from '../store/uiStore';
import type { Toast } from '../store/uiStore';
import s from './AchievementToast.module.css';

function ToastItem({ t }: { t: Toast }) {
  const drop = useUiStore((st) => st.dropToast);
  useEffect(() => {
    const id = setTimeout(() => drop(t.id), 2400);
    return () => clearTimeout(id);
  }, [t.id, drop]);
  return (
    <motion.div
      layout
      className={`${s.toast} ${s[t.kind]}`}
      initial={{ y: -30, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onPointerDown={() => drop(t.id)}
    >
      <span className={s.icon}>
        <Icon name={t.icon} size={18} />
      </span>
      <div className={s.body}>
        <div className={s.title}>
          <span className={s.kicker}>
            {t.kind === 'achievement' ? 'Достижение' : t.kind === 'tool' ? 'Инструмент' : 'Бюро'}
          </span>
          {t.title}
        </div>
        {t.text && <div className={s.text}>{t.text}</div>}
      </div>
    </motion.div>
  );
}

/** Тосты (ачивки, новые инструменты): компактные, по одному, чтобы не закрывать ленту. */
export function AchievementToast() {
  const toasts = useUiStore((st) => st.toasts);
  return (
    <div className={s.stack} aria-live="polite">
      <AnimatePresence>
        {toasts.slice(0, 1).map((t) => (
          <ToastItem key={t.id} t={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
