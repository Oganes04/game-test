import { memo, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { GameObject } from './GameObject';
import type { EngineObj, GameEngine } from '../hooks/useGameLoop';
import s from './ConveyorBelt.module.css';

/** Цвета линий: 1-я синяя, 2-я фиолетовая, 3-я красная. */
export const LANE_COLORS = ['#6c8cff', '#a86bff', '#ff5d73'];

interface Props {
  lane: number;
  engine: GameEngine;
  objects: EngineObj[];
  speed: number;
  paused: boolean;
  selectedId: number | null;
  activeId: number | null;
  shakeId: number | null;
  doubt: boolean;
  objW: number;
  onPress: (obj: EngineObj) => void;
}

export const ConveyorBelt = memo(function ConveyorBelt({
  lane, engine, objects, speed, paused, selectedId, activeId, shakeId, doubt, objW, onPress,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Ширина ленты → движку (скорость считается в «ширинах ленты в секунду»)
  useEffect(() => {
    const el = ref.current;
    if (!el || lane !== 0) return;
    const apply = () => engine.setLayout(el.clientWidth, objW);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [engine, lane, objW]);

  const color = LANE_COLORS[lane] ?? LANE_COLORS[0];
  const style = {
    '--lane-color': color,
    '--belt-dur': `${(0.9 / speed).toFixed(2)}s`,
    '--belt-state': paused ? 'paused' : 'running',
  } as CSSProperties;

  return (
    <div ref={ref} className={s.lane} style={style}>
      <div className={s.track} aria-hidden>
        <div className={s.stripes} />
        <div className={s.rollerTop} />
        <div className={s.rollerBottom} />
      </div>
      <div className={s.edgeIn} aria-hidden />
      <div className={s.edgeOut} aria-hidden />
      {objects.map((o) => (
        <GameObject
          key={o.id}
          obj={o}
          engine={engine}
          selected={o.id === selectedId}
          dragging={o.id === activeId}
          canDrag={o.kind === 'normal' || o.kind === 'shadow' || (o.kind === 'question' && doubt)}
          shake={o.id === shakeId}
          onPress={onPress}
        />
      ))}
    </div>
  );
});
