import { motion } from 'framer-motion';
import { getLevel, ACT_NAMES, LEVELS } from '../data/levels';
import { getLevelIntro } from '../data/levelIntros';
import { CATEGORY_COLOR, CATEGORY_LABEL } from '../data/objects';
import { CHARACTER_SVGS } from '../components/svg/Characters';
import { Icon } from '../components/svg/Icons';
import { useGameStore } from '../store/gameStore';
import { useUiStore } from '../store/uiStore';
import ui from '../styles/ui.module.css';
import sc from './screens.module.css';
import s from './LevelIntroScreen.module.css';

/** Заставка между уровнями: акт, название, реплики и эхо прошлых решений. */
export function LevelIntroScreen() {
  const levelId = useUiStore((st) => st.levelId);
  const go = useUiStore((st) => st.go);
  const story = useGameStore((st) => st.story);
  const level = getLevel(levelId);
  const intro = getLevelIntro(level.id, story);
  const Char = CHARACTER_SVGS[intro.character];
  const actStart = LEVELS.find((l) => l.act === level.act)?.id === level.id;

  return (
    <div className={ui.screen}>
      <div className={sc.topbar}>
        <button className={sc.iconBtn} onClick={() => go('menu')} aria-label="В меню">
          <Icon name="back" size={20} />
        </button>
        <span style={{ flex: 1 }} />
        <button className={sc.iconBtn} onClick={() => go('shop', { backTo: 'levelIntro' })} aria-label="Магазин">
          <Icon name="shop" size={20} />
        </button>
      </div>

      <div className={`${ui.scroll} ${s.body}`}>
        <motion.div className={sc.kicker} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {actStart ? ACT_NAMES[level.act] : `Акт ${['I', 'II', 'III', 'IV', 'V'][level.act - 1]}`}
        </motion.div>
        <motion.h1
          className={s.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className={s.num}>Уровень {level.id}</span>
          {level.title}
        </motion.h1>

        <motion.div className={s.char} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}>
          <Char size={130} />
        </motion.div>

        <div className={s.lines}>
          {intro.lines.map((l, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.2 }}>
              {l}
            </motion.p>
          ))}
          {intro.echo && (
            <motion.p
              className={s.echo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + intro.lines.length * 0.2 }}
            >
              <Icon name="spiral" size={14} /> {intro.echo}
            </motion.p>
          )}
        </div>

        <div className={s.facts}>
          <span className={ui.chip}>
            <Icon name="target" size={14} /> Цель {level.goal}
          </span>
          <span className={ui.chip}>
            <Icon name="clock" size={14} /> {level.time}с
          </span>
          <span className={ui.chip}>
            <Icon name="bolt" size={14} /> {level.speed.toFixed(2)}×
          </span>
          {level.lanes.length > 1 && (
            <span className={ui.chip}>
              <Icon name="list" size={14} /> {level.lanes.length} линии
            </span>
          )}
          {level.orders > 0 && (
            <span className={ui.chip}>
              <Icon name="headphones" size={14} /> Приказы: {level.orders}
            </span>
          )}
        </div>

        <div className={s.bins}>
          {level.bins.map((c) => (
            <span key={c} className={s.bin} style={{ borderColor: CATEGORY_COLOR[c], color: CATEGORY_COLOR[c] }}>
              {CATEGORY_LABEL[c]}
            </span>
          ))}
        </div>
      </div>

      <div className={sc.footer}>
        <button className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => go('game')}>
          <Icon name="play" size={18} /> Начать смену
        </button>
      </div>
    </div>
  );
}
