import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Icon } from './svg/Icons';
import s from './Modal.module.css';

interface Props {
  children: ReactNode;
  onClose?: () => void;
  tone?: 'default' | 'curator' | 'void' | 'gold';
  label?: string;
}

/** Полноэкранная модалка: position fixed, inset 0, safe-area, крестик 44×44 справа сверху. */
export function Modal({ children, onClose, tone = 'default', label }: Props) {
  return (
    <motion.div
      className={`${s.modal} ${s[tone]}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {onClose && (
        <button className={s.close} onClick={onClose} aria-label="Закрыть">
          <Icon name="close" size={20} strokeWidth={2.2} />
        </button>
      )}
      <motion.div
        className={s.content}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
