import { useEffect, useRef, useState } from 'react';
import type { LevelFull } from '../data/levels';
import { BASE_CROSS_TIME, BASE_SPAWN_INTERVAL, LANE_INTERVAL_FACTOR } from '../data/levels';
import type { Category, CharacterId, LevelEvent, ObjectDef, StoryFlags, ToolId } from '../data/types';
import { OBJECT_BY_ID, QUESTION_DEF, SHADOW_DEF } from '../data/objects';
import { TOOLS } from '../data/tools';
import { ORDER_REWARD_COINS } from '../data/bossOrders';
import type { ActiveOrder, OrderHud } from './useBossOrders';
import { orderForgivesEscapes, orderSpeedMultiplier, planOrders, toOrderHud } from './useBossOrders';

/* ───────────────────────── Типы ───────────────────────── */

export type ObjKind = 'normal' | 'character' | 'shadow' | 'question';

export interface EngineObj {
  id: number;
  lane: number;
  x: number;
  def: ObjectDef;
  kind: ObjKind;
  isVoid: boolean;
  characterId?: CharacterId;
  eventId?: string;
  held: boolean;
  pullTo: number | null;
}

export interface Hud {
  time: number;
  lives: number;
  score: number;
  combo: number;
  maxCombo: number;
  sorted: number;
  heat: number;
  light: number;
  slow: number;
  voice: number;
  laugh: number;
  doubt: number;
  eye: number;
  shield: number;
  double: boolean;
  cooldowns: Partial<Record<ToolId, number>>;
  order: OrderHud | null;
  ghost: number;
  hintCat: Category | null;
}

export type Fx =
  | { type: 'correct'; bin: number; pts: number; combo: number; source: SortSource }
  | { type: 'wrong'; bin: number; shielded: boolean }
  | { type: 'escape'; lane: number; free: boolean; shielded: boolean }
  | { type: 'ghost'; frozen: boolean }
  | { type: 'boss'; bin: number }
  | { type: 'shadowHit'; bin: number; shielded: boolean }
  | { type: 'reject'; id: number }
  | { type: 'orderStart'; text: string }
  | { type: 'orderEnd'; complied: boolean }
  | { type: 'sabotage' }
  | { type: 'tool'; tool: ToolId };

export type SortSource = 'player' | 'magnet' | 'ally';

export interface EngineResult {
  win: boolean;
  reason?: string;
  score: number;
  lives: number;
  maxCombo: number;
  ordersDone: number;
  ordersSabotaged: number;
  orderCoins: number;
  lassoUsed: number;
  sorted: number;
  log: string[];
}

export interface EngineCallbacks {
  onObjects: (objs: EngineObj[]) => void;
  onHud: (h: Hud) => void;
  onFx: (fx: Fx) => void;
  onEvent: (ev: LevelEvent) => void;
  onEnd: (r: EngineResult) => void;
  onConsume: (tool: ToolId) => void;
  onTrust: (boss: number, whisper: number) => void;
}

export interface EngineInit {
  story: StoryFlags;
  ghosts: number;
  allies: number;
}

/* ───────────────────────── Движок ───────────────────────── */

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export class GameEngine {
  readonly level: LevelFull;
  private cb: EngineCallbacks;
  story: StoryFlags;

  // раскладка
  laneWidth = 360;
  objSize = 72;

  // состояние смены
  objects: EngineObj[] = [];
  private nextId = 1;
  private elapsed = 0;
  time: number;
  lives = 3;
  score = 0;
  combo = 0;
  maxCombo = 0;
  sorted = 0;
  heat = 0;
  light = 45;
  private spawnTimers: number[];
  private lastDefId: string[] = [];

  // эффекты: момент окончания (по elapsed)
  private slowUntil = 0;
  private voiceUntil = 0;
  private laughUntil = 0;
  private doubtUntil = 0;
  private eyeUntil = 0;
  private ghostUntil = 0;
  shieldCharges = 0;
  doubleActive = false;
  private readyAt: Partial<Record<ToolId, number>> = {};

  // приказы
  private orderPlan: ReturnType<typeof planOrders>;
  private orderIdx = 0;
  order: ActiveOrder | null = null;
  private ordersDone = 0;
  private ordersSabotaged = 0;
  private orderCoins = 0;

  // события сюжета
  private fired = new Set<string>();
  private spawnedChars = new Set<string>();
  private pendingEvent: string | null = null;

  // призраки / союзники
  private ghosts: number;
  private allies: number;
  private nextGhostAt = 0;
  private nextAllyAt = 0;

  // служебное
  selectedId: number | null = null;
  private els = new Map<number, HTMLElement>();
  private pauseReasons = new Set<string>();
  private raf = 0;
  private lastTs = 0;
  private lastHudEmit = 0;
  private ended = false;
  private lassoUsed = 0;
  private log: string[] = [];

  constructor(level: LevelFull, init: EngineInit, cb: EngineCallbacks) {
    this.level = level;
    this.cb = cb;
    this.story = init.story;
    this.time = level.time;
    this.spawnTimers = level.lanes.map((_, i) => 0.4 + i * 0.7);
    this.orderPlan = planOrders(level.orderTypes, level.goal);
    // призраки и союзники: полная сила на ур. 4, вполсилы на 5–9
    const k = level.id === 4 ? 1 : level.id >= 5 && level.id <= 9 ? 0.5 : 0;
    this.ghosts = init.ghosts * k;
    this.allies = init.allies * k;
    this.nextGhostAt = this.ghostInterval();
    this.nextAllyAt = this.allyInterval();
  }

  /* ── жизненный цикл ── */

  start() {
    this.lastTs = performance.now();
    const loop = (ts: number) => {
      const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
      this.lastTs = ts;
      if (!this.ended) this.tick(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
    this.emitHud(true);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.els.clear();
  }

  pause(reason: string) {
    this.pauseReasons.add(reason);
  }

  resume(reason: string) {
    this.pauseReasons.delete(reason);
  }

  get paused() {
    return this.pauseReasons.size > 0;
  }

  setLayout(laneWidth: number, objSize: number) {
    this.laneWidth = laneWidth;
    this.objSize = objSize;
  }

  registerEl(id: number, el: HTMLElement | null) {
    if (el) {
      this.els.set(id, el);
      const o = this.objects.find((x) => x.id === id);
      if (o) el.style.transform = `translate3d(${o.x}px,-50%,0)`;
    } else this.els.delete(id);
  }

  /* ── основной цикл ── */

  private tick(dt: number) {
    if (this.paused) return;
    const lv = this.level;
    this.elapsed += dt;
    this.time -= dt;

    const speedMod = (this.elapsed < this.slowUntil ? 0.5 : 1) * orderSpeedMultiplier(this.order);

    // перегрев: пассивный нагрев от скорости
    this.heat = Math.min(100, this.heat + 0.8 * lv.speed * orderSpeedMultiplier(this.order) * dt);
    if (lv.lightMeter) this.light = Math.max(0, this.light - 2 * dt);

    // приказ
    if (this.order) {
      this.order.remaining -= dt;
      if (this.order.remaining <= 0) this.finishOrder();
    } else if (this.orderIdx < this.orderPlan.length && this.sorted >= this.orderPlan[this.orderIdx].at) {
      const def = this.orderPlan[this.orderIdx++].def;
      this.order = { def, remaining: def.duration, sabotaged: false };
      this.cb.onFx({ type: 'orderStart', text: def.text });
      this.emitHud(true);
    }

    // призраки и союзники
    if (this.ghosts > 0 && this.elapsed >= this.nextGhostAt) {
      this.nextGhostAt = this.elapsed + this.ghostInterval();
      if (this.elapsed < this.laughUntil) {
        this.cb.onFx({ type: 'ghost', frozen: true });
      } else {
        this.time -= 2;
        this.heat = Math.min(100, this.heat + 4);
        this.ghostUntil = this.elapsed + 1.6;
        this.cb.onFx({ type: 'ghost', frozen: false });
      }
    }
    if (this.allies > 0 && this.elapsed >= this.nextAllyAt) {
      this.nextAllyAt = this.elapsed + this.allyInterval();
      const target = this.leftmost();
      if (target) this.sortInternal(target, lv.bins.indexOf(target.def.cat), 'ally');
    }

    // события сюжета
    this.checkEvents();

    // спавн
    let changed = false;
    for (let lane = 0; lane < lv.lanes.length; lane++) {
      this.spawnTimers[lane] -= dt * speedMod;
      if (this.spawnTimers[lane] <= 0 && this.laneHasRoom(lane)) {
        this.spawn(lane);
        changed = true;
        const base = (BASE_SPAWN_INTERVAL / lv.speed) * LANE_INTERVAL_FACTOR[lv.lanes.length];
        this.spawnTimers[lane] = base * rand(0.8, 1.2);
      }
    }

    // движение
    const baseV = (this.laneWidth / BASE_CROSS_TIME) * lv.speed;
    const escaped: EngineObj[] = [];
    for (const o of this.objects) {
      if (o.held) continue;
      if (o.pullTo !== null) {
        o.x += (o.pullTo - o.x) * Math.min(1, dt * 10);
        if (Math.abs(o.pullTo - o.x) < 1) o.pullTo = null;
        continue;
      }
      const v = baseV * (1 + o.lane * 0.08) * speedMod * (o.kind === 'character' ? 0.8 : 1);
      o.x -= v * dt;
      if (o.kind === 'character' && o.eventId && o.x <= this.laneWidth * 0.45 && !this.fired.has(o.eventId)) {
        this.fireEvent(o.eventId);
      }
      if (o.x < -this.objSize) escaped.push(o);
    }
    for (const o of escaped) {
      this.onEscape(o);
      changed = true;
    }

    // DOM: только transform
    for (const o of this.objects) {
      const el = this.els.get(o.id);
      if (el) el.style.transform = `translate3d(${o.x}px,-50%,0)`;
    }

    if (changed) this.emitObjects();

    // конец смены
    if (this.lives <= 0) return this.end(false, 'Жизни закончились');
    if (this.heat >= 100) return this.end(false, 'Перегрев конвейера');
    if (this.time <= 0) return this.end(false, 'Время смены вышло');
    if (this.sorted >= lv.goal && this.allEventsDone() && !this.pendingEvent) return this.end(true);

    this.emitHud(false);
  }

  /* ── спавн ── */

  private laneHasRoom(lane: number) {
    let maxX = -Infinity;
    for (const o of this.objects) if (o.lane === lane && o.x > maxX) maxX = o.x;
    return maxX < this.laneWidth - this.objSize - 14;
  }

  private spawn(lane: number) {
    const lv = this.level;
    let def: ObjectDef;
    let kind: ObjKind = 'normal';
    const r = Math.random();
    if (lv.shadowTwins && r < 0.18) {
      def = SHADOW_DEF;
      kind = 'shadow';
    } else if (lv.questions && r < 0.2) {
      def = QUESTION_DEF;
      kind = 'question';
    } else {
      const cats = lv.lanes[lane].cats;
      const pool = lv.pool.map((id) => OBJECT_BY_ID[id]).filter((d) => cats.includes(d.cat));
      do def = pick(pool);
      while (pool.length > 1 && def.id === this.lastDefId[lane]);
      this.lastDefId[lane] = def.id;
    }
    this.objects.push({
      id: this.nextId++,
      lane,
      x: this.laneWidth + 4,
      def,
      kind,
      isVoid: kind === 'normal' && !!lv.voidObjects && Math.random() < 0.25,
      held: false,
      pullTo: null,
    });
  }

  private spawnCharacter(ev: LevelEvent, lane: number) {
    this.objects.push({
      id: this.nextId++,
      lane,
      x: this.laneWidth + 4,
      def: { id: ev.id, name: ev.id, cat: 'common' },
      kind: 'character',
      isVoid: false,
      characterId: CHAR_FOR_EVENT[ev.id] ?? 'whisper',
      eventId: ev.id,
      held: false,
      pullTo: null,
    });
    this.emitObjects();
  }

  /* ── события ── */

  private activeEvents() {
    return this.level.events.filter((e) => !e.when || e.when(this.story));
  }

  private allEventsDone() {
    return this.activeEvents().every((e) => this.fired.has(e.id));
  }

  private checkEvents() {
    if (this.pendingEvent) return;
    const evs = this.activeEvents();
    evs.forEach((e, idx) => {
      if (this.fired.has(e.id) || this.pendingEvent) return;
      if (e.mode === 'final') {
        if (this.sorted >= this.level.goal) this.fireEvent(e.id);
        return;
      }
      if (this.sorted < e.at) return;
      if (e.mode === 'belt') {
        if (this.spawnedChars.has(e.id)) return;
        const lane = idx % this.level.lanes.length;
        if (!this.laneHasRoom(lane)) return;
        this.spawnedChars.add(e.id);
        this.spawnCharacter(e, lane);
      } else {
        this.fireEvent(e.id);
      }
    });
  }

  /** Открывает событие (дилемму/сцену) — смена на паузе до resolveEvent. */
  fireEvent(id: string) {
    if (this.fired.has(id) || this.pendingEvent) return;
    const ev = this.level.events.find((e) => e.id === id);
    if (!ev) return;
    this.fired.add(id);
    this.pendingEvent = id;
    this.pause('event');
    // персонаж на ленте замирает
    this.objects.forEach((o) => {
      if (o.eventId === id) o.held = true;
    });
    this.cb.onEvent(ev);
  }

  resolveEvent(id: string, logLine?: string) {
    if (this.pendingEvent !== id) return;
    this.pendingEvent = null;
    if (logLine) this.log.push(logLine);
    const before = this.objects.length;
    this.objects = this.objects.filter((o) => o.eventId !== id);
    if (this.objects.length !== before) this.emitObjects();
    this.resume('event');
    this.lastTs = performance.now();
  }

  /** Финальный выбор (ур. 10) завершает смену победой. */
  finishFinal(logLine: string) {
    this.log.push(logLine);
    this.pendingEvent = null;
    this.resume('event');
    this.end(true);
  }

  /* ── сортировка ── */

  hold(id: number, held: boolean) {
    const o = this.objects.find((x) => x.id === id);
    if (o && o.kind !== 'character') o.held = held;
  }

  canDrag(o: EngineObj) {
    if (o.kind === 'character') return false;
    if (o.kind === 'question') return this.elapsed < this.doubtUntil;
    return true;
  }

  /** Попытка игрока отправить объект в контейнер. */
  sort(id: number, bin: number): boolean {
    if (this.paused || this.ended) return false;
    const o = this.objects.find((x) => x.id === id);
    if (!o) return false;
    if (o.kind === 'character') {
      if (o.eventId) this.fireEvent(o.eventId);
      return false;
    }
    if (o.kind === 'question' && this.elapsed >= this.doubtUntil) {
      o.held = false;
      this.cb.onFx({ type: 'reject', id: o.id });
      return false;
    }
    this.sortInternal(o, bin, 'player');
    return true;
  }

  private sortInternal(o: EngineObj, bin: number, source: SortSource) {
    const lv = this.level;
    this.remove(o.id);

    // приказы Начальника влияют только на ручную сортировку
    if (source === 'player' && this.order) {
      const t = this.order.def.type;
      if (t === 'allSecond' && bin === 1 && o.kind === 'normal') {
        this.sorted++;
        this.score += 5;
        this.heat = Math.max(0, this.heat - 2);
        this.cb.onFx({ type: 'boss', bin });
        this.emitHud(true);
        return;
      }
      if (t === 'allSecond' || t === 'dark' || (t === 'onlyFirst' && bin !== 0)) this.sabotage();
    }

    if (o.kind === 'shadow') {
      const shielded = this.hit(1, 10);
      this.combo = 0;
      this.log.push('Тронул тень-двойника');
      this.cb.onFx({ type: 'shadowHit', bin, shielded });
      this.emitHud(true);
      return;
    }

    const correct = o.kind === 'question' || lv.bins[bin] === o.def.cat;
    if (correct) {
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      const mult = this.combo >= 2 ? Math.min(this.combo, 5) : 1;
      const voice = this.elapsed < this.voiceUntil && o.isVoid ? 3 : 1;
      const base = o.kind === 'question' ? 30 : 10;
      const pts = base * mult * (this.doubleActive ? 2 : 1) * voice;
      this.score += pts;
      this.sorted++;
      this.time += 0.5;
      this.heat = Math.max(0, this.heat - 5);
      if (lv.lightMeter) this.light = Math.min(100, this.light + 10);
      this.cb.onFx({ type: 'correct', bin, pts, combo: this.combo, source });
    } else {
      this.combo = 0;
      const shielded = this.hit(1, 12);
      this.time -= 3;
      if (lv.lightMeter) this.light = Math.max(0, this.light - 15);
      this.cb.onFx({ type: 'wrong', bin, shielded });
    }
    this.emitHud(true);
  }

  /** Урон: щит поглощает промах. Возвращает true, если сработал щит. */
  private hit(lives: number, heat: number) {
    this.heat = Math.min(100, this.heat + heat);
    if (this.shieldCharges > 0) {
      this.shieldCharges--;
      return true;
    }
    this.lives -= lives;
    return false;
  }

  private onEscape(o: EngineObj) {
    this.remove(o.id, false);
    if (o.kind !== 'normal') return; // тени и вопросы уходят без штрафа
    if (orderForgivesEscapes(this.order)) {
      this.cb.onFx({ type: 'escape', lane: o.lane, free: true, shielded: false });
      return;
    }
    this.combo = 0;
    const shielded = this.hit(1, 8);
    this.cb.onFx({ type: 'escape', lane: o.lane, free: false, shielded });
    this.emitHud(true);
  }

  private remove(id: number, emit = true) {
    this.objects = this.objects.filter((x) => x.id !== id);
    this.els.delete(id);
    if (this.selectedId === id) this.selectedId = null;
    if (emit) this.emitObjects();
  }

  private leftmost(): EngineObj | null {
    let best: EngineObj | null = null;
    for (const o of this.objects) {
      if (o.kind !== 'normal' || o.held) continue;
      if (!best || o.x < best.x) best = o;
    }
    return best;
  }

  /* ── приказы ── */

  private sabotage() {
    if (this.order && !this.order.sabotaged) {
      this.order.sabotaged = true;
      this.cb.onFx({ type: 'sabotage' });
    }
  }

  private finishOrder() {
    const o = this.order!;
    this.order = null;
    if (o.sabotaged) {
      this.ordersSabotaged++;
      this.cb.onTrust(0, 5);
      this.log.push(`Приказ сорван: «${o.def.text}»`);
    } else {
      this.ordersDone++;
      this.orderCoins += ORDER_REWARD_COINS;
      this.cb.onTrust(5, 0);
      this.log.push(`Приказ выполнен: «${o.def.text}»`);
    }
    this.cb.onFx({ type: 'orderEnd', complied: !o.sabotaged });
    this.emitHud(true);
  }

  /* ── инструменты ── */

  cooldownLeft(tool: ToolId) {
    return Math.max(0, (this.readyAt[tool] ?? 0) - this.elapsed);
  }

  useTool(tool: ToolId): { ok: boolean; selectId?: number } {
    if (this.paused || this.ended) return { ok: false };
    if (this.cooldownLeft(tool) > 0) return { ok: false };
    const def = TOOLS[tool];
    if (this.order?.def.type === 'noTools') this.sabotage();
    let selectId: number | undefined;

    switch (tool) {
      case 'lasso': {
        const t = this.leftmost();
        if (!t) return { ok: false };
        t.pullTo = this.laneWidth * 0.62;
        selectId = t.id;
        this.lassoUsed++;
        break;
      }
      case 'purr':
        if (this.order?.def.type === 'speed') this.sabotage();
        this.slowUntil = this.elapsed + 5;
        break;
      case 'voice':
        this.voiceUntil = this.elapsed + 10;
        break;
      case 'laugh':
        this.laughUntil = this.elapsed + 5;
        this.ghostUntil = 0;
        break;
      case 'doubt':
        this.doubtUntil = this.elapsed + 8;
        break;
      case 'freeze':
        this.time += 15;
        this.cb.onConsume('freeze');
        break;
      case 'magnet': {
        const targets = this.objects.filter((o) => o.kind === 'normal' && !o.held);
        if (!targets.length) return { ok: false };
        targets.forEach((o) => this.sortInternal(o, this.level.bins.indexOf(o.def.cat), 'magnet'));
        break;
      }
      case 'shield':
        if (this.shieldCharges > 0) return { ok: false };
        this.shieldCharges = 3;
        this.cb.onConsume('shield');
        break;
      case 'double':
        if (this.doubleActive) return { ok: false };
        this.doubleActive = true;
        this.cb.onConsume('double');
        break;
      case 'eye':
        this.eyeUntil = this.elapsed + 6;
        break;
    }
    if (def.cd > 0) this.readyAt[tool] = this.elapsed + def.cd;
    this.cb.onFx({ type: 'tool', tool });
    this.emitHud(true);
    return { ok: true, selectId };
  }

  /* ── вывод ── */

  private ghostInterval() {
    return this.ghosts > 0 ? rand(9, 14) / Math.max(0.5, this.ghosts) : Infinity;
  }

  private allyInterval() {
    return this.allies > 0 ? rand(8, 12) / Math.max(0.5, this.allies) : Infinity;
  }

  private emitObjects() {
    this.cb.onObjects(this.objects.slice());
  }

  emitHud(force: boolean) {
    const now = performance.now();
    if (!force && now - this.lastHudEmit < 80) return;
    this.lastHudEmit = now;
    const e = this.elapsed;
    const left = (until: number) => Math.max(0, until - e);
    const cooldowns: Partial<Record<ToolId, number>> = {};
    (Object.keys(this.readyAt) as ToolId[]).forEach((k) => (cooldowns[k] = this.cooldownLeft(k)));
    let hintCat: Category | null = null;
    if (e < this.eyeUntil) {
      const sel = this.objects.find((o) => o.id === this.selectedId && o.kind === 'normal') ?? this.leftmost();
      hintCat = sel?.def.cat ?? null;
    }
    this.cb.onHud({
      time: Math.max(0, this.time),
      lives: this.lives,
      score: this.score,
      combo: this.combo,
      maxCombo: this.maxCombo,
      sorted: this.sorted,
      heat: this.heat,
      light: this.light,
      slow: left(this.slowUntil),
      voice: left(this.voiceUntil),
      laugh: left(this.laughUntil),
      doubt: left(this.doubtUntil),
      eye: left(this.eyeUntil),
      shield: this.shieldCharges,
      double: this.doubleActive,
      cooldowns,
      order: toOrderHud(this.order),
      ghost: left(this.ghostUntil),
      hintCat,
    });
  }

  private end(win: boolean, reason?: string) {
    if (this.ended) return;
    this.ended = true;
    this.emitHud(true);
    this.cb.onEnd({
      win,
      reason,
      score: this.score,
      lives: Math.max(0, this.lives),
      maxCombo: this.maxCombo,
      ordersDone: this.ordersDone,
      ordersSabotaged: this.ordersSabotaged,
      orderCoins: this.orderCoins,
      lassoUsed: this.lassoUsed,
      sorted: this.sorted,
      log: this.log,
    });
  }
}

const CHAR_FOR_EVENT: Record<string, CharacterId> = {
  villain: 'villain',
  robotKitten: 'robotKitten',
  whisper5: 'whisper',
  misha: 'misha',
  ex: 'ex',
  shadow: 'shadow',
  original: 'original',
};

/* ───────────────────────── Хук ───────────────────────── */

export function useGameLoop(level: LevelFull, init: EngineInit, callbacks: Omit<EngineCallbacks, 'onObjects' | 'onHud'>) {
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [objects, setObjects] = useState<EngineObj[]>([]);
  const [hud, setHud] = useState<Hud | null>(null);
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;
  const initRef = useRef(init);

  useEffect(() => {
    const eng = new GameEngine(level, initRef.current, {
      onObjects: setObjects,
      onHud: setHud,
      onFx: (fx) => cbRef.current.onFx(fx),
      onEvent: (ev) => cbRef.current.onEvent(ev),
      onEnd: (r) => cbRef.current.onEnd(r),
      onConsume: (t) => cbRef.current.onConsume(t),
      onTrust: (b, w) => cbRef.current.onTrust(b, w),
    });
    setEngine(eng);
    eng.start();
    // dev-доступ для автотестов
    if (import.meta.env.DEV) (window as unknown as { __engine?: GameEngine }).__engine = eng;

    // пауза при сворачивании браузера
    const onVis = () => (document.hidden ? eng.pause('hidden') : eng.resume('hidden'));
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      eng.destroy();
    };
  }, [level]);

  return { engine, objects, hud };
}
