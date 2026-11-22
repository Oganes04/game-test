import { memo } from 'react';
import type { CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BossHeadphonesSVG } from './svg/Characters';
import type { OrderHud } from '../hooks/useBossOrders';
import s from './BossOrderBar.module.css';

interface Props {
  order: OrderHud | null;
}

/** Приказ Начальника: текст, подсказка про саботаж, обратный отсчёт. */
export const BossOrderBar = memo(function BossOrderBar({ order }: Props) {
  return (
    <AnimatePresence>
      {order && (
        <motion.div
          key={order.type + order.duration}
          className={`${s.bar} ${order.sabotaged ? s.sabotaged : ''}`}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          role="status"
        >
          <BossHeadphonesSVG size={34} />
          <div className={s.body}>
            <div className={s.text}>{order.text}</div>
            <div className={s.hint}>{order.sabotaged ? 'Приказ сорван — Шёпот доволен' : order.hint}</div>
            <div className={s.timer}>
              <div className={s.fill} style={{ '--p': order.remaining / order.duration } as CSSProperties} />
            </div>
          </div>
          <span className={s.sec}>{Math.ceil(order.remaining)}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
