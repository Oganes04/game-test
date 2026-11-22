import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { INTRO_CARDS } from '../data/intro';
import { CHARACTER_SVGS } from '../components/svg/Characters';
import { Icon } from '../components/svg/Icons';
import { useGameStore } from '../store/gameStore';
import { useUiStore } from '../store/uiStore';
import ui from '../styles/ui.module.css';
import s from './IntroScreen.module.css';

/** Вступление: 4 полноэкранные карточки, свайп или «Дальше». */
export function IntroScreen() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = useUiStore((st) => st.go);
  const card = INTRO_CARDS[i];
  const last = i === INTRO_CARDS.length - 1;

  const finish = () => {
    useGameStore.getState().setIntroSeen();
    go('levelIntro');
  };
  const step = (d: number) => {
    const n = i + d;
    if (n < 0) return;
    if (n >= INTRO_CARDS.length) return finish();
    setDir(d);
    setI(n);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) step(1);
    else if (info.offset.x > 60) step(-1);
  };

  const Char = card.character ? CHARACTER_SVGS[card.character] : null;

  return (
    <div className={ui.screen}>
      <div className={s.top}>
        <div className={s.dots}>
          {INTRO_CARDS.map((_, k) => (
            <span key={k} className={`${s.dot} ${k === i ? s.dotOn : ''}`} />
          ))}
        </div>
        <button className={s.skip} onClick={finish}>
          Пропустить
        </button>
      </div>

      <div className={s.viewport}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={i}
            className={s.card}
            custom={dir}
            initial={{ x: dir * 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir * -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={onDragEnd}
          >
            <div className={s.art}>
              {Char ? <Char size={150} /> : card.icon ? <Icon name={card.icon} size={110} strokeWidth={1.1} /> : null}
            </div>
            <div className={s.num}>{String(i + 1).padStart(2, '0')} / 04</div>
            <h2 className={s.title}>{card.title}</h2>
            <p className={s.text}>{card.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={s.nav}>
        <button className={`${ui.btn} ${s.back}`} onClick={() => step(-1)} disabled={i === 0} aria-label="Назад">
          <Icon name="back" size={20} />
        </button>
        <button className={`${ui.btn} ${ui.primary}`} style={{ flex: 1 }} onClick={() => step(1)}>
          {last ? 'Приступить к работе' : 'Дальше'} <Icon name="arrow" size={18} />
        </button>
      </div>
    </div>
  );
}
