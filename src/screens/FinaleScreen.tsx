import { motion } from 'framer-motion';
import { useUiStore } from '../store/uiStore';
import { useGameStore } from '../store/gameStore';
import { FINALES, ENDING_COINS } from '../data/finales';
import { Icon } from '../components/svg/Icons';
import ui from '../styles/ui.module.css';
import sc from './screens.module.css';
import s from './FinaleScreen.module.css';

export function FinaleScreen() {
  const endingId = useUiStore((st) => st.endingId);
  const result = useUiStore((st) => st.result);
  const go = useUiStore((st) => st.go);
  const endings = useGameStore((st) => st.endings);
  if (!endingId) return null;
  const f = FINALES[endingId];

  const playAgain = () => {
    useGameStore.getState().newGame();
    go('levelIntro', { levelId: 1 });
  };

  return (
    <div className={`${ui.screen} ${s.finale}`} style={{ ['--c' as string]: f.color }}>
      <div className={`${ui.scroll} ${s.body}`}>
        <motion.div
          className={s.icon}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, type: 'spring' }}
        >
          <Icon name={f.icon} size={64} strokeWidth={1.3} />
        </motion.div>
        <motion.div className={sc.kicker} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          Концовка {endings.indexOf(endingId) + 1 > 0 ? `· открыто ${endings.length}/6` : ''}
        </motion.div>
        <motion.h1 className={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          {f.title}
        </motion.h1>
        <div className={s.text}>
          {f.paragraphs.map((p, i) => (
            <motion.p
              key={i}
              className={i === 0 ? s.quote : undefined}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + i * 0.9, duration: 0.8 }}
            >
              {p}
            </motion.p>
          ))}
        </div>
        <motion.p
          className={s.reward}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 + f.paragraphs.length * 0.9 }}
        >
          <Icon name="coin" size={16} /> Награда за концовку: +{ENDING_COINS} (однократно)
          {result ? ` · Очки финала: ${result.score}` : ''}
        </motion.p>
      </div>
      <motion.div
        className={sc.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 + f.paragraphs.length * 0.9 }}
      >
        <button className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={playAgain}>
          <Icon name="reset" size={18} /> Сыграть снова
        </button>
        <div className={sc.row}>
          <button className={ui.btn} onClick={() => go('achievements', { backTo: 'menu' })}>
            <Icon name="trophy" size={18} /> Концовки
          </button>
          <button className={ui.btn} onClick={() => go('menu')}>
            <Icon name="back" size={18} /> Меню
          </button>
        </div>
      </motion.div>
    </div>
  );
}
