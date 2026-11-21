import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { levels, bins, objects } from '../data/levels'
import { applyChoice, scenes } from '../data/characters'
import { award, orders, tools } from '../data/extras'
import { useGameStore } from '../store/gameStore'
import useGameLoop from '../hooks/useGameLoop'
import Portrait from '../components/Portrait'

import { initialShift, type Item, type Shift } from '../store/shift'

function ObjectCard({
  item,
  selected,
  glowing,
  question,
  select,
}: {
  item: Item
  selected: boolean
  glowing: boolean
  question: boolean
  select: () => void
}) {
  const drag = useDraggable({ id: item.id })
  return (
    <button
      ref={drag.setNodeRef}
      {...drag.listeners}
      {...drag.attributes}
      onClick={select}
      aria-pressed={selected}
      className={`object ${selected ? 'selected' : ''} ${item.shadow ? 'shadow-item' : ''} ${item.ghost ? 'ghost-item' : ''} ${glowing ? 'glowing' : ''} ${question ? 'question-item' : ''}`}
      style={{
        left: `calc(${item.x}% - 36px)`,
        opacity: drag.isDragging ? 0.25 : undefined,
      }}
    >
      <span>{item.icon}</span>
      <small>{item.name}</small>
    </button>
  )
}
function Bin({
  index,
  active,
  hint,
  lanes,
  free,
  sort,
}: {
  index: number
  active: boolean
  hint: boolean
  lanes: number
  free: boolean
  sort: () => void
}) {
  const drop = useDroppable({ id: `bin-${index}` })
  return (
    <button
      className={`bin bin-${index} ${active || drop.isOver ? 'ready' : ''} ${hint ? 'hint' : ''}`}
      ref={drop.setNodeRef}
      onClick={sort}
    >
      <span className="bin-icon">{['◇', '⚙', '△'][index]}</span>
      <div>
        {bins.slice(0, free ? 1 : lanes).map((labels, i) => (
          <span className={`bin-label lane-${i}`} key={i}>
            {free ? bins[2][index] : labels[index]}
          </span>
        ))}
      </div>
      <kbd>{index + 1}</kbd>
    </button>
  )
}
export default function GameScreen({
  level,
  onExit,
  onComplete,
}: {
  level: number
  onExit: () => void
  onComplete: (stars: number, score: number) => void
}) {
  const [title, speed, lanes, goal] = levels[level - 1]
  const save = useGameStore()
  const checkpoint =
    save.checkpoint?.level === level ? save.checkpoint : undefined
  const [initialState] = useState(() =>
    checkpoint ? structuredClone(checkpoint.shift) : initialShift(),
  )
  const ref = useRef<Shift>(initialState)
  const serial = useRef(checkpoint?.serial ?? 0)
  const lastSaved = useRef(ref.current.elapsed)
  const [view, setView] = useState<Shift>(ref.current)
  const [selected, setSelected] = useState<number>()
  const [dragging, setDragging] = useState<number>()
  const [paused, setPaused] = useState(false)
  const [failed, setFailed] = useState(false)
  const ended = useRef(false)
  const publish = () => setView({ ...ref.current })
  const state = ref.current
  function writeCheckpoint() {
    if (ended.current) return
    lastSaved.current = state.elapsed
    useGameStore.getState().update(() => ({
      checkpoint: {
        level,
        serial: serial.current,
        shift: structuredClone(state),
      },
    }))
  }
  useEffect(() => {
    window.addEventListener('pagehide', writeCheckpoint)
    return () => window.removeEventListener('pagehide', writeCheckpoint)
  }, [level])
  const dialogues = scenes(level, save.story)
  const scene = dialogues.find((item) => item.id === view.pending)
  const active = (id: string) => state.effects[id] > state.elapsed
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
  )
  function damage(incorrect: boolean) {
    if (state.shield) state.shield--
    else state.life--
    state.combo = 0
    if (level === 9) {
      state.light = Math.max(0, state.light - 12)
      state.clean = false
    }
    if (incorrect) {
      state.time -= 3
      state.heat = Math.min(100, state.heat + 12)
    }
    state.flash = incorrect ? 'Ошибка сортировки' : 'Объект ушёл за край'
  }
  function sort(id: number | undefined, bin: number, automatic = false) {
    const item = state.items.find((entry) => entry.id === id)
    if (!item || state.pending || ended.current || paused) return
    if (!automatic && state.order?.type === 0 && bin !== 0) {
      state.flash = 'Заблокировано приказом. Можно саботировать приказ.'
      publish()
      return
    }
    state.items = state.items.filter((entry) => entry !== item)
    setSelected(undefined)
    const forced = !automatic && state.order?.type === 3 && bin === 1
    if (
      state.order &&
      !automatic &&
      (state.order.type === 0 || state.order.type === 3)
    ) {
      state.order.obeyed ||= state.order.type === 0 ? bin === 0 : bin === 1
    }
    if (
      (item.shadow && !active('doubt')) ||
      ((level !== 10 || active('doubt')) && bin !== item.target)
    )
      damage(true)
    else {
      state.count++
      state.combo++
      state.peak = Math.max(state.peak, state.combo)
      state.score +=
        10 *
        Math.min(state.combo, 5) *
        (active('double') ? 2 : 1) *
        (active('voice') && item.void ? 3 : 1)
      state.time += 0.5
      state.heat = Math.max(0, state.heat - 4)
      if (level === 9) state.light = Math.min(100, state.light + 5)
      state.flash = forced
        ? 'Приказ выполнен'
        : state.combo > 1
          ? `Серия ×${Math.min(state.combo, 5)}`
          : 'Верно'
    }
    writeCheckpoint()
    publish()
  }
  function resolveOrder(sabotaged: boolean) {
    if (!state.order) return
    state.order = undefined
    lastSaved.current = state.elapsed
    useGameStore.getState().update((s) => {
      const next = {
        ...s,
        checkpoint: {
          level,
          serial: serial.current,
          shift: structuredClone(state),
        },
        coins: s.coins + (sabotaged ? 0 : 5),
        stats: {
          ...s.stats,
          [sabotaged ? 'sabotagedOrders' : 'totalOrders']:
            (sabotaged ? s.stats.sabotagedOrders : s.stats.totalOrders) + 1,
        },
        story: {
          ...s.story,
          [sabotaged ? 'whisperTrust' : 'bossTrust']: String(
            Number(s.story[sabotaged ? 'whisperTrust' : 'bossTrust'] || 0) + 5,
          ),
        },
      }
      return { ...next, ...award(next) }
    })
  }
  function finish() {
    ended.current = true
    if (state.order) resolveOrder(!state.order.obeyed)
    const stars =
      state.life === 3 && state.peak >= 5 ? 3 : state.life >= 2 ? 2 : 1
    useGameStore.getState().update((s) => {
      const old = s.levelProgress[level]
      const finale = level === 10 ? s.story.finale : undefined
      const fresh = !!finale && !s.endings.includes(finale)
      const next = {
        ...s,
        checkpoint: undefined,
        level: Math.min(10, Math.max(s.level, level + 1)),
        coins: s.coins + 20 + stars * 10 + (fresh ? 100 : 0),
        story:
          level === 9 && state.clean
            ? { ...s.story, cleanLight: 'yes' }
            : s.story,
        levelProgress: {
          ...s.levelProgress,
          [level]: {
            stars: Math.max(stars, old?.stars || 0),
            bestScore: Math.max(state.score, old?.bestScore || 0),
            completed: true as const,
          },
        },
        endings: fresh ? [...s.endings, finale!] : s.endings,
      }
      return { ...next, ...award(next) }
    })
    onComplete(stars, state.score)
  }
  useGameLoop(!paused && !failed && !scene, (delta) => {
    if (ended.current) return
    if (state.life <= 0 || state.time <= 0 || state.heat >= 100) {
      ended.current = true
      useGameStore.getState().update(() => ({ checkpoint: undefined }))
      setFailed(true)
      return
    }
    const next = dialogues.find((entry) => !state.done.includes(entry.id))
    const threshold = [3, 9, 10].includes(level)
      ? goal
      : level === 1
        ? 5
        : level === 7 && state.done.length
          ? 25
          : level === 6
            ? 3
            : 8
    if (next && state.count >= threshold) {
      state.pending = next.id
      writeCheckpoint()
      publish()
      return
    }
    if (state.count >= goal) {
      finish()
      return
    }
    state.elapsed += delta
    state.time -= delta
    const times =
      level === 3 ? [12] : level === 6 ? [12, 42] : level > 3 ? [20] : []
    if (
      !state.order &&
      state.orderIndex < times.length &&
      state.elapsed >= times[state.orderIndex]
    ) {
      state.orderIndex++
      const type = Math.floor(Math.random() * orders.length)
      state.order = {
        type,
        until: state.elapsed + orders[type][1],
        obeyed: type !== 0 && type !== 3,
      }
    }
    if (state.order && state.elapsed >= state.order.until)
      resolveOrder(!state.order.obeyed)
    if (state.elapsed >= state.spawn) {
      const id = serial.current++
      const lane = id % lanes
      const pool = objects[level === 10 ? 2 : lane]
      const [icon, name, target] =
        pool[(Math.floor(id / lanes) + lane * 3) % pool.length]
      const shadow = level === 8 && id % 6 === 4
      const hostile =
        save.story.sad_villain === 'rules' ||
        save.story.robot_kitten === 'rules'
      const ghost = (level === 4 || level === 5) && hostile && id % 8 === 6
      const ally =
        level === 4 &&
        (save.story.sad_villain === 'saved' ||
          ['saved', 'memory'].includes(save.story.robot_kitten)) &&
        id % 8 === 7
      const item = {
        id,
        lane,
        x: 91,
        icon: ghost ? '👻' : icon,
        name: shadow ? '???' : ghost ? 'Призрак' : name,
        target,
        shadow,
        ghost,
        void: level >= 5 && id % 3 === 0,
      }
      state.items = [...state.items, item]
      state.spawn = state.elapsed + 118 / goal
      if (ally) {
        sort(id, target, true)
        state.flash = 'Союзник помог с сортировкой'
      }
    }
    for (const item of state.items) {
      if (item.id === dragging || (item.ghost && active('laugh'))) continue
      item.x -=
        delta *
        (8.3 + item.lane * 0.65) *
        speed *
        (active('purr') ? 0.5 : 1) *
        (state.order?.type === 1 ? 2 : 1)
    }
    const expired = state.items.filter((item) => item.x < 4)
    for (const item of expired) {
      if (item.ghost) {
        state.time -= 5
        state.flash = 'Призрак забрал 5 секунд'
      } else if (!item.shadow) damage(false)
      if (item.id === selected) setSelected(undefined)
    }
    if (expired.length) state.items = state.items.filter((item) => item.x >= 4)
    if (state.elapsed - lastSaved.current >= 1) writeCheckpoint()
    publish()
  })
  function choose(id: string, value: string) {
    state.done.push(id)
    state.pending = undefined
    lastSaved.current = state.elapsed
    useGameStore.getState().update((s) => {
      const story = applyChoice(s.story, id, value)
      const unlocked = new Set(s.unlockedTools)
      if (id === 'robot_kitten' && (value === 'saved' || value === 'memory'))
        unlocked.add('purr')
      if (id === 'whisperSaved' && value === 'saved') unlocked.add('voice')
      if (id === 'misha' && value !== 'rules') unlocked.add('laugh')
      if (id === 'shadow' && value === 'freed') unlocked.add('doubt')
      const next = {
        ...s,
        story,
        unlockedTools: [...unlocked],
        checkpoint: {
          level,
          serial: serial.current,
          shift: structuredClone(state),
        },
      }
      return { ...next, ...award(next) }
    })
    publish()
  }
  function useTool(id: string, cooldown: number) {
    if (
      state.pending ||
      paused ||
      failed ||
      state.order?.type === 2 ||
      (state.cooldowns[id] || 0) > state.elapsed
    )
      return
    const item = state.items.find((item) => item.id === selected)
    if (id === 'eye' && !item) return
    if (id === 'lasso') {
      const nearest = state.items.reduce<Item | undefined>(
        (best, item) => (!best || item.x < best.x ? item : best),
        undefined,
      )
      if (!nearest) return
      nearest.x = 79
      useGameStore.getState().update((s) => {
        const next = {
          ...s,
          stats: { ...s.stats, lassoUsed: s.stats.lassoUsed + 1 },
        }
        return { ...next, ...award(next) }
      })
    }
    if (
      id === 'magnet' &&
      !state.items.some((obj) => !obj.ghost && (!obj.shadow || active('doubt')))
    )
      return
    if (id === 'magnet')
      for (const obj of [...state.items])
        if (!obj.ghost && (!obj.shadow || active('doubt')))
          sort(obj.id, obj.target, true)
    if (id === 'time') state.time += 15
    if (id === 'shield') state.shield = 3
    const duration: Record<string, number> = {
      purr: 5,
      voice: 10,
      laugh: 5,
      doubt: 8,
      eye: 5,
      double: 1000000,
    }
    if (id in duration) state.effects[id] = state.elapsed + duration[id]
    state.cooldowns[id] = state.elapsed + cooldown
    if (cooldown) writeCheckpoint()
    else {
      lastSaved.current = state.elapsed
      useGameStore.getState().update((s) => ({
        purchasedTools: s.purchasedTools.filter((tool) => tool !== id),
        checkpoint: {
          level,
          serial: serial.current,
          shift: structuredClone(state),
        },
      }))
    }
    publish()
  }
  const selectedItem = view.items.find((item) => item.id === selected)
  const npc =
    level === 3 ? 'whisper' : level === 9 ? 'originalRobot' : undefined
  const npcVisible = npc && view.count >= 4 && !view.done.includes(npc)
  function approachNpc() {
    if (!npc || paused || state.pending || ended.current) return
    state.pending = npc
    writeCheckpoint()
    publish()
  }
  return (
    <section
      className="shift"
      onKeyDown={(event) => {
        if (!scene && ['1', '2', '3'].includes(event.key))
          sort(selected, Number(event.key) - 1)
        if (event.key === 'Escape' && !scene && !failed) setPaused((v) => !v)
      }}
    >
      <header className="shift-heading">
        <button className="small" onClick={() => setPaused(true)}>
          Ⅱ <span>Пауза</span>
        </button>
        <div>
          <span className="eyebrow">
            Смена {String(level).padStart(2, '0')} / 10
          </span>
          <h1>{title}</h1>
        </div>
        <span className="credits">◈ {save.coins}</span>
      </header>
      <div className="hud">
        <div>
          <span>ПРОГРЕСС</span>
          <strong>
            {view.count}
            <small> / {goal}</small>
          </strong>
        </div>
        <div>
          <span>ВРЕМЯ</span>
          <strong>{Math.max(0, Math.ceil(view.time))}с</strong>
        </div>
        <div>
          <span>ЖИЗНИ</span>
          <strong className="hearts">
            {'♥'.repeat(Math.max(0, view.life))}
            <em>{'♡'.repeat(Math.min(3, 3 - Math.max(0, view.life)))}</em>
          </strong>
        </div>
        <div>
          <span>ОЧКИ {save.story.hasChip === 'yes' ? '· ▣' : ''}</span>
          <strong>{view.score}</strong>
        </div>
      </div>
      <div className="meters">
        <label>
          Перегрев <progress max={100} value={view.heat} />
        </label>
        {level === 9 && (
          <label>
            Свет <progress max={100} value={view.light} />
          </label>
        )}
        <output>{view.flash || 'Смена началась'}</output>
      </div>
      {view.order && (
        <aside className="order">
          <div>
            🎧 {orders[view.order.type][0]}{' '}
            <small>{Math.ceil(view.order.until - view.elapsed)}с</small>
          </div>
          <button
            className="small"
            onClick={() => {
              resolveOrder(true)
              publish()
            }}
          >
            Саботировать
          </button>
        </aside>
      )}
      <DndContext
        sensors={sensors}
        onDragStart={({ active }) => setDragging(Number(active.id))}
        onDragCancel={() => setDragging(undefined)}
        onDragEnd={({ active, over }) => {
          setDragging(undefined)
          if (over) sort(Number(active.id), Number(String(over.id).slice(-1)))
        }}
      >
        <div
          className={`belts ${view.order?.type === 4 ? 'blackout' : ''} ${level === 9 ? 'void-belt' : ''}`}
          style={{ '--light': view.light / 100 } as React.CSSProperties}
        >
          {Array.from({ length: lanes }, (_, lane) => (
            <div className={`belt lane-${lane}`} key={lane}>
              <div className="belt-tag">
                ЛИНИЯ {String(lane + 1).padStart(2, '0')}
              </div>
              <div className="track">
                {view.items
                  .filter((item) => item.lane === lane)
                  .map((item) => (
                    <ObjectCard
                      key={item.id}
                      item={item}
                      selected={selected === item.id}
                      question={level === 10}
                      glowing={!!active('voice') && item.void}
                      select={() => setSelected(item.id)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
        <div className="sorting-label">
          {selectedItem ? selectedItem.name : 'Выбери или перетащи объект'}
          {npcVisible && (
            <button className="npc-call" onClick={approachNpc}>
              {level === 3 ? '◉ Глаз под лентой' : '◇ Прототип на полке'}{' '}
              <span>›</span>
            </button>
          )}
        </div>
        <div className="bins">
          {[0, 1, 2].map((index) => (
            <Bin
              key={index}
              index={index}
              lanes={lanes}
              free={level === 10}
              active={!!selectedItem}
              hint={!!active('eye') && selectedItem?.target === index}
              sort={() => sort(selected, index)}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {dragging !== undefined && (
            <div className="drag-overlay">
              {view.items.find((item) => item.id === dragging)?.icon}
            </div>
          )}
        </DragOverlay>
      </DndContext>
      <div className="toolrow">
        {tools
          .filter(
            ([id]) =>
              (id === 'lasso' && level >= 2) ||
              save.unlockedTools.includes(id) ||
              save.purchasedTools.includes(id),
          )
          .map(([id, icon, name, , cd, description]) => {
            const left = Math.max(
              0,
              Math.ceil((view.cooldowns[id] || 0) - view.elapsed),
            )
            return (
              <button
                key={id}
                title={description}
                disabled={left > 0 || view.order?.type === 2}
                onClick={() => useTool(id, cd)}
              >
                {icon} {name} {left ? `· ${left}с` : ''}
              </button>
            )
          })}
      </div>
      {scene && (
        <div className="veil">
          <motion.div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={scene.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Portrait kind={scene.art} />
            <span className="eyebrow">ВСТРЕЧА НА ЛЕНТЕ</span>
            <h2>{scene.name}</h2>
            <p>{scene.text}</p>
            <div className="choices">
              {scene.choices.map(([label, value]) => (
                <button key={value} onClick={() => choose(scene.id, value)}>
                  {label}
                  <span>›</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
      {(paused || failed) && (
        <div className="veil">
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={failed ? 'Смена прервана' : 'Пауза'}
          >
            <h2>{failed ? 'Смена прервана' : 'Смена на паузе'}</h2>
            {failed && (
              <p>
                {view.heat >= 100
                  ? 'Лента перегрелась.'
                  : view.time <= 0
                    ? 'Время смены вышло.'
                    : 'Закончились жизни.'}
              </p>
            )}
            <div className="choices">
              <button
                onClick={() => {
                  if (failed) {
                    Object.assign(state, initialShift())
                    serial.current = 0
                    setSelected(undefined)
                    setDragging(undefined)
                    ended.current = false
                    setFailed(false)
                    writeCheckpoint()
                    useGameStore
                      .getState()
                      .update((s) => ({
                        stats: {
                          ...s.stats,
                          totalGames: s.stats.totalGames + 1,
                        },
                      }))
                    publish()
                  }
                  setPaused(false)
                }}
              >
                {failed ? 'Повторить смену' : 'Продолжить'}
              </button>
              <button
                onClick={() => {
                  if (failed)
                    useGameStore
                      .getState()
                      .update(() => ({ checkpoint: undefined }))
                  else writeCheckpoint()
                  onExit()
                }}
              >
                В главное меню
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
