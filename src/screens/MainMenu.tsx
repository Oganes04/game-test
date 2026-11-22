import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore, isLevelUnlocked, nextLevelId } from '../store/gameStore';
import { useUiStore } from '../store/uiStore';
import { LEVELS, ACT_NAMES } from '../data/levels';
import { ENDING_ORDER } from '../data/finales';
import { secretProgress } from '../utils/secretPath';
import { Icon } from '../components/svg/Icons';
import { BossHeadphonesSVG, CuratorSVG, RobotKittenSVG } from '../components/svg/Characters';
import { Modal } from '../components/Modal';
import ui from '../styles/ui.module.css';
import sc from './screens.module.css';
import s from './MainMenu.module.css';

export function MainMenu() {
  const go = useUiStore((st) => st.go);
  const coins = useGameStore((st) => st.coins);
  const progress = useGameStore((st) => st.levelProgress);
  const introSeen = useGameStore((st) => st.introSeen);
  const endings = useGameStore((st) => st.endings);
  const story = useGameStore((st) => st.story);
  const [levelsOpen, setLevelsOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | 'new' | 'reset'>(null);

  const next = nextLevelId(progress);
  const hasProgress = Object.keys(progress).length > 0;
  const allDone = !!progress[10]?.completed;

  const startLevel = (id: number) => go(introSeen ? 'levelIntro' : 'intro', { levelId: id });

  const newGame = () => {
    useGameStore.getState().newGame();
    setConfirm(null);
    go('intro', { levelId: 1 });
  };

  return (
    <div className={`${ui.screen} ${s.menu}`}>
      <div className={s.top}>
        <span className={sc.coins}>
          <Icon name="coin" size={18} /> {coins}
        </span>
        {endings.length > 0 && (
          <span className={ui.chip}>
            <Icon name="trophy" size={14} /> Концовки {endings.length}/{ENDING_ORDER.length}
          </span>
        )}
      </div>

      <div className={s.hero}>
        <div className={s.emblem} aria-hidden>
          <div className={s.curator}>
            <CuratorSVG size={92} />
          </div>
          <div className={s.belt}>
            <div className={s.beltStripes} />
          </div>
          <div className={s.kitten}>
            <RobotKittenSVG size={64} />
          </div>
          <div className={s.boss}>
            <BossHeadphonesSVG size={40} />
          </div>
        </div>
        <motion.h1
          className={s.title}
          initial={{ opacity: 0, letterSpacing: '0.5em' }}
          animate={{ opacity: 1, letterSpacing: '0.16em' }}
          transition={{ duration: 1 }}
        >
          КОНВЕЙЕР
        </motion.h1>
        <p className={s.sub}>Бюро Сортировки · смена {hasProgress ? next : 1}</p>
      </div>

      <nav className={s.buttons}>
        {hasProgress ? (
          <button className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => startLevel(next)}>
            <Icon name="play" size={18} />
            {allDone ? 'Финал ещё раз' : `Продолжить · Ур. ${next}`}
          </button>
        ) : (
          <button className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={() => go('intro', { levelId: 1 })}>
            <Icon name="play" size={18} /> Начать смену
          </button>
        )}
        {hasProgress && (
          <button className={`${ui.btn} ${ui.block}`} onClick={() => setConfirm('new')}>
            <Icon name="reset" size={18} /> Новая игра
          </button>
        )}
        <button className={`${ui.btn} ${ui.block}`} onClick={() => setLevelsOpen(true)}>
          <Icon name="list" size={18} /> Уровни
        </button>
        <div className={sc.row}>
          <button className={ui.btn} onClick={() => go('shop', { backTo: 'menu' })}>
            <Icon name="shop" size={18} /> Магазин
          </button>
          <button className={ui.btn} onClick={() => go('achievements', { backTo: 'menu' })}>
            <Icon name="trophy" size={18} /> Достижения
          </button>
        </div>
      </nav>

      <div className={s.bottom}>
        {hasProgress && (
          <span className={s.secret} title="Секретный путь">
            <Icon name="spiral" size={14} /> {secretProgress(story)}/7
          </span>
        )}
        <button className={s.reset} onClick={() => setConfirm('reset')}>
          Стереть сохранение
        </button>
      </div>

      <AnimatePresence>
        {levelsOpen && (
          <Modal key="levels" onClose={() => setLevelsOpen(false)} label="Уровни">
            <h2 className={ui.title} style={{ fontSize: 'var(--fs-lg)' }}>Уровни</h2>
            <div className={s.levels}>
              {LEVELS.map((l) => {
                const unlocked = isLevelUnlocked(l.id, progress);
                const p = progress[l.id];
                const actStart = LEVELS.find((x) => x.act === l.act)?.id === l.id;
                return (
                  <div key={l.id}>
                    {actStart && <div className={s.act}>{ACT_NAMES[l.act]}</div>}
                    <button
                      className={s.levelBtn}
                      disabled={!unlocked}
                      onClick={() => {
                        setLevelsOpen(false);
                        startLevel(l.id);
                      }}
                    >
                      <span className={s.levelNum}>{unlocked ? l.id : <Icon name="lock" size={16} />}</span>
                      <span className={s.levelInfo}>
                        <b>{l.title}</b>
                        <small>
                          {l.lanes.length > 1 ? `${l.lanes.length} линии · ` : ''}
                          {l.feature}
                        </small>
                      </span>
                      <span className={s.levelStars}>
                        {[1, 2, 3].map((i) => (
                          <Icon
                            key={i}
                            name={p && p.stars >= i ? 'star' : 'starEmpty'}
                            size={14}
                            className={p && p.stars >= i ? sc.starOn : sc.starOff}
                          />
                        ))}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </Modal>
        )}
        {confirm && (
          <Modal key="confirm" onClose={() => setConfirm(null)} label="Подтверждение">
            <h2 className={ui.title} style={{ fontSize: 'var(--fs-lg)', textAlign: 'center' }}>
              {confirm === 'new' ? 'Начать сначала?' : 'Стереть всё?'}
            </h2>
            <p className={ui.muted} style={{ textAlign: 'center' }}>
              {confirm === 'new'
                ? 'Сюжет и прогресс уровней сбросятся. Монеты, покупки, достижения и концовки останутся.'
                : 'Удалятся монеты, покупки, достижения, концовки и прогресс. Это нельзя отменить.'}
            </p>
            <button
              className={`${ui.btn} ${confirm === 'reset' ? ui.danger : ui.primary} ${ui.block}`}
              onClick={() => {
                if (confirm === 'new') newGame();
                else {
                  useGameStore.getState().resetAll();
                  setConfirm(null);
                }
              }}
            >
              {confirm === 'new' ? 'Да, новая смена' : 'Да, стереть'}
            </button>
            <button className={`${ui.btn} ${ui.block}`} onClick={() => setConfirm(null)}>
              Отмена
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
