import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { useUiStore } from '../store/uiStore';
import { ACHIEVEMENTS } from '../data/achievements';
import { ENDING_ORDER, FINALES } from '../data/finales';
import { SECRET_CONDITIONS } from '../utils/secretPath';
import { Icon } from '../components/svg/Icons';
import ui from '../styles/ui.module.css';
import sc from './screens.module.css';
import s from './AchievementsScreen.module.css';

export function AchievementsScreen() {
  const go = useUiStore((st) => st.go);
  const backTo = useUiStore((st) => st.backTo);
  const got = useGameStore((st) => st.achievements);
  const endings = useGameStore((st) => st.endings);
  const story = useGameStore((st) => st.story);
  const stats = useGameStore((st) => st.stats);
  const trust = useGameStore((st) => st.trust);

  return (
    <div className={ui.screen}>
      <div className={sc.topbar}>
        <button className={sc.iconBtn} onClick={() => go(backTo)} aria-label="Назад">
          <Icon name="back" size={20} />
        </button>
        <h1>Достижения</h1>
        <span className={ui.chip}>
          {got.length}/{ACHIEVEMENTS.length}
        </span>
      </div>

      <div className={`${ui.scroll} ${sc.stack}`}>
        <div className={s.grid}>
          {ACHIEVEMENTS.map((a, i) => {
            const on = got.includes(a.id);
            return (
              <motion.div
                key={a.id}
                className={`${s.ach} ${on ? s.on : ''}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
              >
                <span className={s.icon}>
                  <Icon name={on ? a.icon : 'lock'} size={22} />
                </span>
                <b>{a.title}</b>
                <small>{a.desc}</small>
              </motion.div>
            );
          })}
        </div>

        <div className={sc.kicker} style={{ marginTop: 14 }}>
          Концовки · {endings.length}/6
        </div>
        <div className={s.grid}>
          {ENDING_ORDER.map((id) => {
            const f = FINALES[id];
            const on = endings.includes(id);
            return (
              <div key={id} className={`${s.ach} ${on ? s.on : ''}`} style={on ? { borderColor: f.color } : undefined}>
                <span className={s.icon} style={on ? { color: f.color } : undefined}>
                  <Icon name={on ? f.icon : 'lock'} size={22} />
                </span>
                <b>{on ? f.title : '???'}</b>
              </div>
            );
          })}
        </div>

        <div className={sc.kicker} style={{ marginTop: 14 }}>
          Секретный путь
        </div>
        <div className={`${sc.card} ${s.secret}`}>
          {SECRET_CONDITIONS.map((c) => {
            const done = c.done(story);
            return (
              <p key={c.id} className={done ? s.done : ''}>
                <Icon name={done ? 'check' : 'lock'} size={14} /> {done ? c.label : '???'}
              </p>
            );
          })}
        </div>

        <div className={sc.kicker} style={{ marginTop: 14 }}>
          Статистика
        </div>
        <div className={`${sc.card} ${s.stats}`}>
          <p>Смен сыграно <b>{stats.totalGames}</b></p>
          <p>Объектов рассортировано <b>{stats.totalSorted}</b></p>
          <p>Приказов выполнено <b>{stats.totalOrders}</b></p>
          <p>Приказов сорвано <b>{stats.sabotagedOrders}</b></p>
          <p>Лассо использовано <b>{stats.lassoUsed}</b></p>
          <p>Доверие Начальника / Шёпота <b>{trust.boss} / {trust.whisper}</b></p>
        </div>
      </div>
    </div>
  );
}
