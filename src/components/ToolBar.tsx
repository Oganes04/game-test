import { memo } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from './svg/Icons';
import { TOOLS } from '../data/tools';
import type { ToolId } from '../data/types';
import type { Hud } from '../hooks/useGameLoop';
import s from './ToolBar.module.css';

export interface ToolSlot {
  id: ToolId;
  count?: number;
}

interface Props {
  tools: ToolSlot[];
  hud: Hud;
  locked: boolean;
  onUse: (id: ToolId) => void;
}

/** Сколько секунд осталось у активного эффекта инструмента (для подсветки). */
function activeLeft(id: ToolId, hud: Hud): number {
  switch (id) {
    case 'purr': return hud.slow;
    case 'voice': return hud.voice;
    case 'laugh': return hud.laugh;
    case 'doubt': return hud.doubt;
    case 'eye': return hud.eye;
    case 'shield': return hud.shield > 0 ? 1 : 0;
    case 'double': return hud.double ? 1 : 0;
    default: return 0;
  }
}

export const ToolBar = memo(function ToolBar({ tools, hud, locked, onUse }: Props) {
  if (!tools.length) {
    return (
      <div className={s.empty}>
        Инструменты появятся по ходу смены
      </div>
    );
  }
  return (
    <div className={`${s.bar} ${tools.length > 4 ? s.scroll : ''}`}>
      {tools.map(({ id, count }) => {
        const def = TOOLS[id];
        const cd = hud.cooldowns[id] ?? 0;
        const cdPct = def.cd > 0 ? cd / def.cd : 0;
        const active = activeLeft(id, hud) > 0;
        const empty = def.consumable && !count;
        const cls = [s.tool, cd > 0 && s.cooling, active && s.active, locked && s.locked, empty && s.empty2]
          .filter(Boolean)
          .join(' ');
        return (
          <button
            key={id}
            className={cls}
            style={{ '--tool-color': def.color, '--cd': cdPct } as CSSProperties}
            onPointerDown={(e) => {
              e.preventDefault();
              if (!empty) onUse(id);
            }}
            aria-label={def.name}
            title={`${def.name}: ${def.desc}`}
          >
            <span className={s.cdRing} aria-hidden />
            <Icon name={def.icon} size={22} />
            {cd > 0 && <span className={s.cdNum}>{Math.ceil(cd)}</span>}
            {def.consumable && <span className={s.badge}>{count ?? 0}</span>}
            {locked && (
              <span className={s.lock}>
                <Icon name="lock" size={11} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});
