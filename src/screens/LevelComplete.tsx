import { motion } from 'framer-motion';
import { useUiStore } from '../store/uiStore';
import { useGameStore } from '../store/gameStore';
import { getLevel } from '../data/levels';
import { Icon } from '../components/svg/Icons';
import ui from '../styles/ui.module.css';
import sc from './screens.module.css';
import s from './LevelComplete.module.css';

export function LevelComplete() {
  const r = useUiStore((st) => st.result);
  const go = useUiStore((st) => st.go);
  const coins = useGameStore((st) => st.coins);
  if (!r) return null;
  const level = getLevel(r.levelId);
  const hasNext = r.levelId < 10;

  return (
    <div className={ui.screen}>
      <div className={sc.topbar}>
        <button className={sc.iconBtn} onClick={() => go('menu')} aria-label="В меню">
          <Icon name="back" size={20} />
        </button>
        <span style={{ flex: 1 }} />
        <span className={sc.coins}>
          <Icon name="coin" size={16} /> {coins}
        </span>
      </div>

      <div className={`${ui.scroll} ${s.body}`}>
        <div className={sc.kicker}>
          Уровень {level.id} · {level.title}
        </div>
        <motion.h1
          className={`${s.title} ${r.win ? s.win : s.lose}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {r.win ? 'Смена закрыта' : 'Смена сорвана'}
        </motion.h1>
        {!r.win && <p className={s.reason}>{r.reason}</p>}

        {r.win && (
          <div className={sc.stars}>
            {[1, 2, 3].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.25 + i * 0.18, type: 'spring', stiffness: 300 }}
              >
                <Icon
                  name={r.stars >= i ? 'star' : 'starEmpty'}
                  size={46}
                  className={r.stars >= i ? sc.starOn : sc.starOff}
                />
              </motion.span>
            ))}
          </div>
        )}
        {r.win && (
          <p className={s.starHint}>
            {r.stars === 3 ? 'Идеально: 3 жизни и комбо ×5' : r.stars === 2 ? 'Для 3★ — без потерь и комбо ×5' : 'Для 2★ — сохрани 2+ жизни'}
          </p>
        )}

        <div className={`${sc.card} ${s.stats}`}>
          <div>
            <span>Очки</span>
            <b>{r.score}</b>
          </div>
          <div>
            <span>Жизни</span>
            <b>{r.lives}/3</b>
          </div>
          <div>
            <span>Макс. комбо</span>
            <b>×{Math.min(5, Math.max(1, r.maxCombo))}</b>
          </div>
          <div>
            <span>Монеты</span>
            <b className={s.gold}>+{r.coins}</b>
          </div>
          {(r.ordersDone > 0 || r.ordersSabotaged > 0) && (
            <div>
              <span>Приказы</span>
              <b>
                {r.ordersDone} выполн. · {r.ordersSabotaged} сорв.
              </b>
            </div>
          )}
        </div>

        {r.log.length > 0 && (
          <div className={`${sc.card} ${s.log}`}>
            <div className={sc.kicker}>Журнал смены</div>
            {r.log.map((l, i) => (
              <motion.p key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08 }}>
                <Icon name="check" size={14} /> {l}
              </motion.p>
            ))}
          </div>
        )}
      </div>

      <div className={sc.footer}>
        {r.win && hasNext ? (
          <button
            className={`${ui.btn} ${ui.primary} ${ui.block}`}
            onClick={() => go('levelIntro', { levelId: r.levelId + 1 })}
          >
            Дальше · Ур. {r.levelId + 1} <Icon name="arrow" size={18} />
          </button>
        ) : (
          <button className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => go('game', { levelId: r.levelId })}>
            <Icon name="reset" size={18} /> Повторить смену
          </button>
        )}
        <div className={sc.row}>
          {r.win && (
            <button className={ui.btn} onClick={() => go('game', { levelId: r.levelId })}>
              <Icon name="reset" size={18} /> Ещё раз
            </button>
          )}
          <button className={ui.btn} onClick={() => go('shop', { backTo: 'complete' })}>
            <Icon name="shop" size={18} /> Магазин
          </button>
        </div>
      </div>
    </div>
  );
}
