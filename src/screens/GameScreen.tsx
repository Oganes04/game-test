import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';

import { getLevel } from '../data/levels';
import { getBeat, getDilemma, ghostsAndAllies, resolveDilemma } from '../data/dilemmas';
import type { Beat, Dilemma } from '../data/dilemmas';
import { resolveEnding } from '../data/finales';
import { SHOP_TOOLS, TOOLS, storyTools } from '../data/tools';
import type { EndingId, LevelEvent, ToolId } from '../data/types';

import { useGameLoop } from '../hooks/useGameLoop';
import type { EngineObj, EngineResult, Fx } from '../hooks/useGameLoop';
import { useDragObject } from '../hooks/useDragObject';
import { useBossOrders } from '../hooks/useBossOrders';
import { checkAchievements, useGameStore } from '../store/gameStore';
import { useUiStore } from '../store/uiStore';

import { HUD } from '../components/HUD';
import { ConveyorBelt } from '../components/ConveyorBelt';
import { ObjectCard } from '../components/GameObject';
import { Bin } from '../components/Bin';
import type { BinFlash } from '../components/Bin';
import { ToolBar } from '../components/ToolBar';
import type { ToolSlot } from '../components/ToolBar';
import { BossOrderBar } from '../components/BossOrderBar';
import { DilemmaModal } from '../components/DilemmaModal';
import { CharacterModal } from '../components/CharacterModal';
import { Modal } from '../components/Modal';
import { Icon } from '../components/svg/Icons';
import { AllySVG, CuratorSVG, GhostSVG, WhisperSVG } from '../components/svg/Characters';
import ui from '../styles/ui.module.css';
import s from './GameScreen.module.css';

type ModalState =
  | { type: 'dilemma'; ev: LevelEvent; dilemma: Dilemma }
  | { type: 'beat'; ev: LevelEvent; beat: Beat }
  | { type: 'pause' }
  | null;

interface Floater {
  id: number;
  text: string;
  tone: 'good' | 'bad' | 'gold' | 'ghost' | 'info';
  /** 0..2 — над контейнером, -1 — по центру ленты */
  at: number;
}

/** Раскладка по числу линий: высота ленты и размер объектов. */
const LAYOUT: Record<number, { laneH: number; laneMin: number; objW: number; objH: number }> = {
  1: { laneH: 280, laneMin: 160, objW: 72, objH: 80 },
  2: { laneH: 170, laneMin: 112, objW: 70, objH: 78 },
  3: { laneH: 124, laneMin: 84, objW: 60, objH: 68 },
};

let floaterId = 1;

export function GameScreen() {
  const levelId = useUiStore((st) => st.levelId);
  const go = useUiStore((st) => st.go);
  const level = useMemo(() => getLevel(levelId), [levelId]);
  const story = useGameStore((st) => st.story);
  const coins = useGameStore((st) => st.coins);
  const purchased = useGameStore((st) => st.purchasedTools);

  // Призраки/союзники и флаги — снимок на момент начала смены
  const [init] = useState(() => {
    const st = useGameStore.getState().story;
    return { story: st, ...ghostsAndAllies(st) };
  });

  const [modal, setModal] = useState<ModalState>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [flashes, setFlashes] = useState<(BinFlash | null)[]>([null, null, null]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [vignette, setVignette] = useState(0);
  const [allyKey, setAllyKey] = useState(0);
  const outcomeLog = useRef<string>('');
  const endingRef = useRef<EndingId | null>(null);
  const finalAnswer = useRef<string>('');

  /* ── эффекты (fx) ── */

  const float = useCallback((text: string, tone: Floater['tone'], at: number) => {
    const id = floaterId++;
    setFloaters((f) => [...f.slice(-5), { id, text, tone, at }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 950);
  }, []);

  const flashBin = useCallback((bin: number, ok: boolean) => {
    setFlashes((f) => f.map((x, i) => (i === bin ? { ok, key: Date.now() + Math.random() } : x)));
  }, []);

  const hurt = useCallback(() => {
    setVignette((v) => v + 1);
    navigator.vibrate?.(40);
  }, []);

  const onFx = (fx: Fx) => {
    switch (fx.type) {
      case 'correct':
        flashBin(fx.bin, true);
        if (fx.source === 'ally') {
          float('Союзник помог', 'good', fx.bin);
          setAllyKey((k) => k + 1);
        } else {
          const m = fx.combo >= 2 ? ` ×${Math.min(5, fx.combo)}` : '';
          float(`+${fx.pts}${m}`, fx.combo >= 5 ? 'gold' : 'good', fx.bin);
        }
        break;
      case 'wrong':
        flashBin(fx.bin, false);
        float(fx.shielded ? 'Щит! −3с' : 'Ошибка −1 −3с', 'bad', fx.bin);
        if (!fx.shielded) hurt();
        break;
      case 'escape':
        if (fx.free) float('Начальник прикрыл', 'gold', -1);
        else {
          float(fx.shielded ? 'Упущено — щит' : 'Упущено −1', 'bad', -1);
          if (!fx.shielded) hurt();
        }
        break;
      case 'ghost':
        float(fx.frozen ? 'Призрак заморожен' : 'Призрак крадёт −2с', fx.frozen ? 'info' : 'ghost', -1);
        break;
      case 'boss':
        flashBin(fx.bin, true);
        float('+5 Начальнику', 'gold', fx.bin);
        break;
      case 'shadowHit':
        flashBin(fx.bin, false);
        float(fx.shielded ? 'Тень! Щит' : 'Тень! −1', 'ghost', fx.bin);
        if (!fx.shielded) hurt();
        break;
      case 'reject':
        setShakeId(fx.id);
        setTimeout(() => setShakeId(null), 380);
        float('Нужно «Сомнение»', 'ghost', -1);
        break;
      case 'orderStart':
        navigator.vibrate?.([20, 40, 20]);
        break;
      case 'orderEnd':
        float(fx.complied ? 'Приказ выполнен +5' : 'Саботаж: Шёпот +5', fx.complied ? 'gold' : 'ghost', -1);
        break;
      case 'sabotage':
        float('Саботаж!', 'ghost', -1);
        break;
      case 'tool':
        float(TOOLS[fx.tool].name, 'info', -1);
        break;
    }
  };

  /* ── сюжетные события ── */

  const onEvent = (ev: LevelEvent) => {
    setSelectedId(null);
    const st = useGameStore.getState().story;
    if (ev.kind === 'dilemma') {
      const d = getDilemma(ev.id, st);
      if (d) return setModal({ type: 'dilemma', ev, dilemma: d });
    } else {
      const b = getBeat(ev.id, { ghosts: init.ghosts, allies: init.allies });
      if (b) {
        outcomeLog.current = resolveDilemma(ev.id, '').log;
        return setModal({ type: 'beat', ev, beat: b });
      }
    }
    engineRef.current?.resolveEvent(ev.id);
  };

  const onEnd = (r: EngineResult) => {
    const store = useGameStore.getState();
    const stars = (!r.win ? 0 : r.lives === 3 && r.maxCombo >= 5 ? 3 : r.lives >= 2 ? 2 : 1) as 0 | 1 | 2 | 3;
    const coinsEarned = r.win ? 20 + stars * 10 + r.orderCoins : r.orderCoins;
    store.addStats({
      totalGames: 1,
      totalOrders: r.ordersDone,
      sabotagedOrders: r.ordersSabotaged,
      lassoUsed: r.lassoUsed,
      totalSorted: r.sorted,
    });
    if (r.win && stars > 0) store.completeLevel(level.id, stars as 1 | 2 | 3, r.score, coinsEarned);
    else store.addCoins(coinsEarned);
    const ending = endingRef.current;
    if (ending) store.addEnding(ending);
    checkAchievements({
      levelId: level.id, win: r.win, maxCombo: r.maxCombo, stars, lives: r.lives, ordersSabotaged: r.ordersSabotaged,
    });
    const uiS = useUiStore.getState();
    uiS.setResult({
      levelId: level.id,
      win: r.win,
      reason: r.reason,
      score: r.score,
      stars,
      lives: r.lives,
      maxCombo: r.maxCombo,
      coins: coinsEarned,
      ordersDone: r.ordersDone,
      ordersSabotaged: r.ordersSabotaged,
      log: r.log,
      ending: ending ?? undefined,
    });
    if (ending) uiS.setEnding(ending);
    setTimeout(() => uiS.go(ending ? 'finale' : 'complete'), r.win ? 500 : 900);
  };

  const { engine, objects, hud } = useGameLoop(level, init, {
    onFx,
    onEvent,
    onEnd,
    onConsume: (t) => useGameStore.getState().consumeTool(t),
    onTrust: (b, w) => useGameStore.getState().addTrust(b, w),
  });
  const engineRef = useRef(engine);
  engineRef.current = engine;

  // базовые инструменты по сюжету (Лассо со 2-го уровня) — сохраняем в сейв
  useEffect(() => {
    useGameStore.getState().unlockTools(storyTools(useGameStore.getState().story, level.id));
  }, [level.id]);

  // флаги, изменённые выбором посреди смены, — в движок
  useEffect(() => {
    if (engine) engine.story = story;
  }, [engine, story]);

  // снимаем выделение, если объект уехал/рассортирован
  useEffect(() => {
    if (selectedId !== null && !objects.some((o) => o.id === selectedId)) setSelectedId(null);
  }, [objects, selectedId]);

  /* ── ввод ── */

  const select = useCallback(
    (id: number | null) => {
      setSelectedId(id);
      if (engine) engine.selectedId = id;
    },
    [engine],
  );

  const onPressObject = useCallback(
    (o: EngineObj) => {
      if (!engine) return;
      if (o.kind === 'character' && o.eventId) return engine.fireEvent(o.eventId);
      setSelectedId((cur) => {
        const next = cur === o.id ? null : o.id;
        engine.selectedId = next;
        return next;
      });
    },
    [engine],
  );

  const onPressBin = useCallback(
    (i: number) => {
      if (!engine || selectedId === null) return;
      engine.sort(selectedId, i);
      select(null);
    },
    [engine, selectedId, select],
  );

  const onUseTool = useCallback(
    (id: ToolId) => {
      if (!engine) return;
      const res = engine.useTool(id);
      if (res.selectId) select(res.selectId);
    },
    [engine, select],
  );

  const drag = useDragObject(engine, (id) => {
    if (id === selectedId) select(null);
  });

  /* ── модалки ── */

  const openPause = () => {
    engine?.pause('menu');
    setModal({ type: 'pause' });
  };
  const closePause = () => {
    engine?.resume('menu');
    setModal(null);
  };

  const chooseDilemma = (ev: LevelEvent, optId: string, label: string): string | null => {
    if (ev.id === 'final') {
      const st = useGameStore.getState().story;
      endingRef.current = resolveEnding(optId, st);
      finalAnswer.current = label;
      setTimeout(() => engine?.finishFinal(`Ответ Куратору: «${label}»`), 400);
      return null;
    }
    const out = resolveDilemma(ev.id, optId);
    const store = useGameStore.getState();
    store.setStory(out.patch);
    if (out.trust) store.addTrust(out.trust.boss ?? 0, out.trust.whisper ?? 0);
    if (out.unlock) {
      const fresh = store.unlockTools(out.unlock);
      fresh.forEach((t) =>
        useUiStore.getState().pushToast({ kind: 'tool', title: TOOLS[t].name, text: TOOLS[t].desc, icon: TOOLS[t].icon }),
      );
    }
    outcomeLog.current = out.log;
    checkAchievements();
    return out.response;
  };

  const finishEvent = (ev: LevelEvent) => {
    engine?.resolveEvent(ev.id, outcomeLog.current);
    outcomeLog.current = '';
    setModal(null);
  };

  // свернули браузер — открываем паузу, чтобы смена не продолжилась внезапно
  const modalRef = useRef(modal);
  modalRef.current = modal;
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && engine && !modalRef.current) {
        engine.pause('menu');
        setModal({ type: 'pause' });
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [engine]);

  /* ── производные ── */

  const tools: ToolSlot[] = useMemo(() => {
    const base = storyTools(story, level.id).map((id) => ({ id }));
    const shop = SHOP_TOOLS.filter((id) => purchased[id] !== undefined).map((id) => ({
      id,
      count: TOOLS[id].consumable ? purchased[id] ?? 0 : undefined,
    }));
    return [...base, ...shop];
  }, [story, level.id, purchased]);

  const orderUi = useBossOrders(hud?.order ?? null);
  const layout = LAYOUT[level.lanes.length] ?? LAYOUT[1];
  const laneObjects = useMemo(
    () => level.lanes.map((_, i) => objects.filter((o) => o.lane === i)),
    [objects, level.lanes],
  );
  const activeObj = drag.activeId !== null ? objects.find((o) => o.id === drag.activeId) : undefined;
  const hintBin = hud?.hintCat ? level.bins.indexOf(hud.hintCat) : -1;
  const paused = !!modal || !engine;
  const corner =
    level.id === 3 ? 'whisper' : level.id === 6 ? 'curator' : level.id === 9 && story.whisperSaved ? 'whisper' : null;

  const vars = {
    '--lane-h': `${layout.laneH}px`,
    '--lane-min': `${layout.laneMin}px`,
    '--obj-w': `${layout.objW}px`,
    '--obj-h': `${layout.objH}px`,
  } as CSSProperties;

  if (!engine || !hud) return <div className={s.root} />;

  return (
    <div className={s.root} style={vars}>
      <HUD level={level} hud={hud} coins={coins} onPause={openPause} />

      <DndContext
        sensors={drag.sensors}
        collisionDetection={drag.collisionDetection}
        onDragStart={drag.onDragStart}
        onDragEnd={drag.onDragEnd}
        onDragCancel={drag.onDragCancel}
        autoScroll={false}
      >
        <main className={s.field}>
          <BossOrderBar order={hud.order} />

          {corner && (
            <div className={s.corner} aria-hidden>
              {corner === 'whisper' ? <WhisperSVG size={56} /> : <CuratorSVG size={60} />}
            </div>
          )}

          {hud.combo >= 2 && (
            <motion.div key={Math.min(hud.combo, 5)} className={s.combo} initial={{ scale: 1.4 }} animate={{ scale: 1 }}>
              Комбо ×{Math.min(hud.combo, 5)}
            </motion.div>
          )}

          <div className={s.lanes}>
            {level.lanes.map((_, i) => (
              <ConveyorBelt
                key={i}
                lane={i}
                engine={engine}
                objects={laneObjects[i]}
                speed={level.speed * (hud.slow > 0 ? 0.5 : 1) * (hud.order?.type === 'speed' ? 2 : 1)}
                paused={paused}
                selectedId={selectedId}
                activeId={drag.activeId}
                shakeId={shakeId}
                doubt={hud.doubt > 0}
                objW={layout.objW}
                onPress={onPressObject}
              />
            ))}
          </div>

          {/* Пустота: шкала света */}
          {level.lightMeter && (
            <div className={s.darkness} style={{ opacity: 0.97 * (1 - hud.light / 100) }} aria-hidden />
          )}

          {/* Приказ «Не смотри на ленту!» */}
          <AnimatePresence>
            {orderUi.dark && (
              <motion.div
                className={s.blackout}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-hidden
              >
                <span>Не смотри на ленту…</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Призрак крадёт время */}
          <AnimatePresence>
            {hud.ghost > 0 && (
              <motion.div
                className={s.ghostFly}
                initial={{ x: '110%', opacity: 0 }}
                animate={{ x: '-30%', opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
                aria-hidden
              >
                <GhostSVG size={90} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Центр. всплывающие подписи */}
          <div className={s.centerFx} aria-live="polite">
            <AnimatePresence>
              {floaters
                .filter((f) => f.at === -1)
                .map((f) => (
                  <motion.span
                    key={f.id}
                    className={`${s.floater} ${s[f.tone]}`}
                    initial={{ y: 10, opacity: 0, scale: 0.9 }}
                    animate={{ y: -18, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.35 }}
                  >
                    {f.text}
                  </motion.span>
                ))}
            </AnimatePresence>
          </div>
        </main>

        <section className={s.bins}>
          {level.bins.map((cat, i) => (
            <Bin
              key={i}
              index={i}
              cat={cat}
              armed={selectedId !== null || drag.activeId !== null}
              locked={orderUi.lockedBins.has(i)}
              trap={orderUi.trapBin === i}
              hint={hintBin === i}
              flash={flashes[i]}
              onPress={onPressBin}
            />
          ))}
          <div className={s.binFx} aria-hidden>
            <AnimatePresence>
              {floaters
                .filter((f) => f.at >= 0)
                .map((f) => (
                  <motion.span
                    key={f.id}
                    className={`${s.floater} ${s[f.tone]}`}
                    style={{ left: `${((f.at + 0.5) / 3) * 100}%` }}
                    initial={{ y: 0, opacity: 0, x: '-50%' }}
                    animate={{ y: -34, opacity: 1, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    transition={{ duration: 0.4 }}
                  >
                    {f.text}
                  </motion.span>
                ))}
            </AnimatePresence>
            <AnimatePresence>
              {allyKey > 0 && (
                <motion.span
                  key={allyKey}
                  className={s.ally}
                  initial={{ opacity: 1, scale: 0.4 }}
                  animate={{ opacity: 0, scale: 1.4 }}
                  transition={{ duration: 0.8 }}
                >
                  <AllySVG size={60} />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </section>

        <DragOverlay dropAnimation={null}>
          {activeObj ? <ObjectCard obj={activeObj} lifted /> : null}
        </DragOverlay>
      </DndContext>

      <ToolBar tools={tools} hud={hud} locked={orderUi.toolsLocked} onUse={onUseTool} />

      {/* вспышка урона по краям экрана */}
      <AnimatePresence>
        {vignette > 0 && (
          <motion.div
            key={vignette}
            className={s.vignette}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal?.type === 'dilemma' && (
          <DilemmaModal
            key={modal.ev.id}
            dilemma={modal.dilemma}
            onChoose={(opt) =>
              chooseDilemma(modal.ev, opt, modal.dilemma.options.find((o) => o.id === opt)?.label ?? '')
            }
            onDone={() => finishEvent(modal.ev)}
          />
        )}
        {modal?.type === 'beat' && (
          <CharacterModal key={modal.ev.id} beat={modal.beat} onDone={() => finishEvent(modal.ev)} />
        )}
        {modal?.type === 'pause' && (
          <Modal key="pause" onClose={closePause} label="Пауза">
            <h2 className={ui.title} style={{ textAlign: 'center' }}>Пауза</h2>
            <p className={ui.muted} style={{ textAlign: 'center' }}>
              Ур. {level.id} · {level.title} · {Math.min(hud.sorted, level.goal)}/{level.goal}
            </p>
            <button className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={closePause}>
              <Icon name="play" size={18} /> Продолжить
            </button>
            <button className={`${ui.btn} ${ui.block}`} onClick={() => go('game')}>
              <Icon name="reset" size={18} /> Начать смену заново
            </button>
            <button className={`${ui.btn} ${ui.ghost} ${ui.block}`} onClick={() => go('menu')}>
              <Icon name="back" size={18} /> В главное меню
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
