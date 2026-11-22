import { memo } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from './svg/Icons';
import type { Hud } from '../hooks/useGameLoop';
import type { LevelFull } from '../data/levels';
import s from './HUD.module.css';

interface Props {
  level: LevelFull;
  hud: Hud;
  coins: number;
  onPause: () => void;
}

export const HUD = memo(function HUD({ level, hud, coins, onPause }: Props) {
  const timePct = Math.min(100, (hud.time / level.time) * 100);
  const lowTime = hud.time < 10;
  const hot = hud.heat > 70;
  const progress = Math.min(hud.sorted, level.goal);

  return (
    <header className={s.hud}>
      <div className={s.row}>
        <button className={s.pause} onPointerDown={onPause} aria-label="Пауза">
          <Icon name="pause" size={18} strokeWidth={2.4} />
        </button>
        <div className={s.level}>
          <span className={s.levelNum}>Ур {level.id}/10</span>
          <span className={s.levelTitle}>{level.title}</span>
        </div>
        <div className={s.progress} aria-label="Прогресс">
          <b>{progress}</b>
          <span>/{level.goal}</span>
        </div>
        <div className={s.right}>
          <span className={s.lives} aria-label={`Жизни: ${hud.lives}`}>
            {[0, 1, 2].map((i) => (
              <Icon
                key={i}
                name={i < hud.lives ? 'heart' : 'heartEmpty'}
                size={15}
                className={i < hud.lives ? s.heartOn : s.heartOff}
              />
            ))}
            {hud.shield > 0 && (
              <span className={s.shield} title="Щит">
                <Icon name="shield" size={13} />
                {hud.shield}
              </span>
            )}
          </span>
          <span className={s.score} title="Очки">
            {hud.score}
          </span>
          <span className={s.coins} title="Монеты">
            <Icon name="coin" size={14} />
            <span className={s.coinNum}>{coins}</span>
          </span>
        </div>
      </div>
      <div className={s.meters}>
        <div className={s.meter} title="Таймер">
          <Icon name="clock" size={12} />
          <div className={s.bar}>
            <div
              className={`${s.fill} ${lowTime ? s.fillDanger : ''}`}
              style={{ '--p': timePct / 100, '--c': 'var(--accent-primary)' } as CSSProperties}
            />
          </div>
          <span className={`${s.num} ${lowTime ? s.danger : ''}`}>{Math.ceil(hud.time)}с</span>
        </div>
        <div className={s.meter} title="Перегрев">
          <Icon name="flame" size={12} className={hot ? s.danger : undefined} />
          <div className={s.bar}>
            <div
              className={`${s.fill} ${hot ? s.fillDanger : ''}`}
              style={{ '--p': hud.heat / 100, '--c': hot ? 'var(--accent-danger)' : 'var(--accent-gold)' } as CSSProperties}
            />
          </div>
          <span className={`${s.num} ${hot ? s.danger : ''}`}>{Math.round(hud.heat)}%</span>
        </div>
        {level.lightMeter && (
          <div className={s.meter} title="Свет">
            <Icon name="bolt" size={12} />
            <div className={s.bar}>
              <div className={s.fill} style={{ '--p': hud.light / 100, '--c': '#f4f1e8' } as CSSProperties} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
});
