import { memo, useId } from 'react';
import s from './svg.module.css';

export interface CharProps {
  size?: number;
  className?: string;
}

/** Уникальный id для defs (useId содержит «:», которые ломают url(#…) в части браузеров). */
const useSvgId = () => useId().replace(/:/g, '');

function Frame({ size = 80, className, children, label }: CharProps & { children: React.ReactNode; label: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${s.root} ${className ?? ''}`}
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

/* 1. Грустный злодей — плащ, капюшон, котёнок в руках */
export const VillainSVG = memo(function VillainSVG(p: CharProps) {
  const id = useSvgId();
  return (
    <Frame {...p} label="Грустный злодей">
      <defs>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#262a45" />
          <stop offset="1" stopColor="#06070d" />
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor="#fff6d8" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffd166" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="95" rx="28" ry="4" fill="#000" opacity=".45" />
      <g className={s.cloak}>
        <path d="M50 6C31 6 25 26 25 40L13 93Q50 99 87 93L75 40C75 26 69 6 50 6Z" fill={`url(#${id}c)`} />
        <path d="M50 6C40 9 36 20 36 30l-6 60M50 6c10 3 14 14 14 24l6 60" stroke="#3a3f63" strokeWidth="1" fill="none" opacity=".5" />
      </g>
      <ellipse cx="50" cy="33" rx="13" ry="15" fill="#010205" />
      <g className={s.dimEyes}>
        <circle cx="44.5" cy="34" r="1.8" fill="#9aa5c8" />
        <circle cx="55.5" cy="34" r="1.8" fill="#9aa5c8" />
      </g>
      {/* свечение котёнка */}
      <circle cx="50" cy="66" r="19" fill={`url(#${id}g)`} className={s.glowSoft} />
      <g className={s.float}>
        <ellipse cx="50" cy="69" rx="9" ry="6.5" fill="#f4efff" />
        <circle cx="50" cy="60" r="6" fill="#f4efff" />
        <path d="M45 57l-1-6 4 3zM55 57l1-6-4 3z" fill="#f4efff" />
        <circle cx="47.8" cy="60" r=".9" fill="#2a2440" /><circle cx="52.2" cy="60" r=".9" fill="#2a2440" />
        <path d="M49 62.5q1 .8 2 0" stroke="#2a2440" strokeWidth=".7" fill="none" />
      </g>
      {/* руки в рукавах */}
      <path d="M30 60c6 10 14 14 20 14s14-4 20-14c-4 2-8 5-20 5s-16-3-20-5z" fill="#141729" />
    </Frame>
  );
});

/* 2. Робот-котёнок */
export const RobotKittenSVG = memo(function RobotKittenSVG(p: CharProps) {
  const id = useSvgId();
  return (
    <Frame {...p} label="Робот-котёнок">
      <defs>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5568" />
          <stop offset="1" stopColor="#2d3748" />
        </linearGradient>
        <radialGradient id={`${id}e`}>
          <stop offset="0" stopColor="#ffd166" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffd166" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="93" rx="26" ry="4" fill="#000" opacity=".45" />
      {/* хвост-провод */}
      <g className={s.tailWag}>
        <path d="M68 74c10 0 16-6 14-14-1-5 4-8 8-5" stroke="#1a202c" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M68 74c10 0 16-6 14-14-1-5 4-8 8-5" stroke="#718096" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeDasharray="2 3" />
        <rect x="88" y="52" width="5" height="4" rx="1" fill="#a0aec0" />
      </g>
      {/* тело */}
      <rect x="28" y="58" width="44" height="32" rx="12" fill={`url(#${id}m)`} stroke="#1a202c" strokeWidth="1.5" />
      <rect x="40" y="66" width="20" height="10" rx="3" fill="#1a202c" />
      <circle cx="45" cy="71" r="1.6" fill="#3ddc97" className={s.blink} />
      <path d="M50 71h7" stroke="#6c8cff" strokeWidth="1.2" />
      {/* голова */}
      <path d="M24 30l4-16 13 10zM76 30l-4-16-13 10z" fill={`url(#${id}m)`} stroke="#1a202c" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M28 20l2-3 5 4zM72 20l-2-3-5 4z" fill="#ff8fa3" opacity=".5" />
      <rect x="22" y="22" width="56" height="40" rx="16" fill={`url(#${id}m)`} stroke="#1a202c" strokeWidth="1.5" />
      <path d="M30 30h40" stroke="#718096" strokeWidth="1" opacity=".5" />
      <circle cx="28" cy="52" r="1.2" fill="#a0aec0" /><circle cx="72" cy="52" r="1.2" fill="#a0aec0" />
      {/* глаза */}
      <circle cx="39" cy="42" r="10" fill={`url(#${id}e)`} />
      <circle cx="61" cy="42" r="10" fill={`url(#${id}e)`} />
      <circle cx="39" cy="42" r="5.5" fill="#ffd166" className={s.pulse} />
      <circle cx="61" cy="42" r="5.5" fill="#ffd166" className={s.pulse} />
      <circle cx="40.5" cy="40.5" r="1.6" fill="#fff" /><circle cx="62.5" cy="40.5" r="1.6" fill="#fff" />
      <path d="M47 52l3 2 3-2" stroke="#1a202c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* антенна */}
      <path d="M50 22V8" stroke="#a0aec0" strokeWidth="2" />
      <circle cx="50" cy="7" r="3.5" fill="#ff5d73" className={s.blink} />
      <circle cx="50" cy="7" r="7" fill="#ff5d73" opacity=".25" className={s.blink} />
    </Frame>
  );
});

/* 3. Шёпот (Артём) — полупрозрачный, один глаз, размытое тело */
export const WhisperSVG = memo(function WhisperSVG(p: CharProps) {
  const id = useSvgId();
  return (
    <Frame {...p} label="Шёпот">
      <defs>
        <filter id={`${id}t`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="6" />
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d6aa8" />
          <stop offset="1" stopColor="#7d6aa8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}e`}>
          <stop offset="0" stopColor="#f2d6ff" />
          <stop offset=".35" stopColor="#c86bff" />
          <stop offset="1" stopColor="#c86bff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className={s.flicker} opacity=".7">
        <g filter={`url(#${id}t)`}>
          <path d="M50 10c-12 0-18 10-18 20 0 6 2 10 5 13-10 5-15 16-17 30l-4 22h68l-4-22c-2-14-7-25-17-30 3-3 5-7 5-13 0-10-6-20-18-20z" fill={`url(#${id}b)`} />
        </g>
        <circle cx="50" cy="30" r="14" fill={`url(#${id}e)`} className={s.glowSoft} />
        <ellipse cx="50" cy="30" rx="5.5" ry="4" fill="#fbeaff" />
        <circle cx="50" cy="30" r="2.2" fill="#3b0f5c" />
      </g>
    </Frame>
  );
});

/* 4. Миша — ребёнок, полупрозрачный, грустный, бирка */
export const MishaSVG = memo(function MishaSVG(p: CharProps) {
  return (
    <Frame {...p} label="Миша">
      <ellipse cx="50" cy="95" rx="20" ry="3.5" fill="#000" opacity=".35" />
      <g className={s.sway} opacity=".65">
        <circle cx="50" cy="40" r="26" fill="#9fb4ff" opacity=".12" />
        {/* тело */}
        <path d="M34 92V70c0-9 7-15 16-15s16 6 16 15v22z" fill="#5f74b8" />
        <path d="M42 92V80M58 92V80" stroke="#3b4a80" strokeWidth="2" />
        {/* бирка */}
        <rect x="52" y="64" width="11" height="8" rx="1.5" fill="#e8eeff" />
        <path d="M54 67h7M54 69.5h4" stroke="#5f74b8" strokeWidth="1" />
        <path d="M57.5 64l-2-4" stroke="#e8eeff" strokeWidth=".8" />
        {/* голова */}
        <circle cx="50" cy="40" r="14" fill="#d8e0ff" />
        <path d="M36 37c2-10 10-13 16-12 8 1 12 6 12 12-4-3-8-5-14-4-5 0-10 2-14 4z" fill="#3b4a80" />
        {/* грустное лицо */}
        <path d="M42.5 40l3.5 1.2M57.5 40L54 41.2" stroke="#3b4a80" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="45" cy="43.5" r="1.3" fill="#3b4a80" /><circle cx="55" cy="43.5" r="1.3" fill="#3b4a80" />
        <path d="M46 50q4-3 8 0" stroke="#3b4a80" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d="M44.5 46v3" stroke="#9fd0ff" strokeWidth="1" strokeLinecap="round" />
      </g>
    </Frame>
  );
});

/* 5. Она — силуэт без лица, заполненный туманом */
export const ExSVG = memo(function ExSVG(p: CharProps) {
  const id = useSvgId();
  return (
    <Frame {...p} label="Она">
      <defs>
        <clipPath id={`${id}c`}>
          <path d="M50 8c-10 0-15 8-15 17 0 6-3 14-6 22 4 2 8 3 10 3l-9 44h40l-9-44c2 0 6-1 10-3-3-8-6-16-6-22 0-9-5-17-15-17z" />
        </clipPath>
        <radialGradient id={`${id}f`}>
          <stop offset="0" stopColor="#f2ebe4" stopOpacity=".85" />
          <stop offset="1" stopColor="#f2ebe4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f8796" />
          <stop offset="1" stopColor="#3b3742" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="95" rx="22" ry="3.5" fill="#000" opacity=".35" />
      <g opacity=".9">
        <g clipPath={`url(#${id}c)`}>
          <rect x="0" y="0" width="100" height="100" fill={`url(#${id}b)`} />
          <ellipse cx="45" cy="35" rx="22" ry="16" fill={`url(#${id}f)`} className={s.fogA} />
          <ellipse cx="56" cy="72" rx="24" ry="18" fill={`url(#${id}f)`} className={s.fogB} />
        </g>
        {/* лицо — пустой овал */}
        <ellipse cx="50" cy="26" rx="8" ry="10" fill="#d9d2cc" opacity=".55" />
      </g>
    </Frame>
  );
});

/* 6. Тень Куратора — форма Сортировщика, вместо лица свечение */
export const ShadowSVG = memo(function ShadowSVG(p: CharProps) {
  const id = useSvgId();
  return (
    <Frame {...p} label="Тень Куратора">
      <defs>
        <filter id={`${id}b`}>
          <feGaussianBlur stdDeviation=".9" />
        </filter>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor="#efe2ff" />
          <stop offset=".4" stopColor="#a86bff" />
          <stop offset="1" stopColor="#a86bff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="95" rx="24" ry="3.5" fill="#000" opacity=".5" />
      <g filter={`url(#${id}b)`} opacity=".9">
        <path d="M26 94l3-26c1-9 9-14 21-14s20 5 21 14l3 26z" fill="#141826" />
        {/* форма: воротник, нашивка, пуговицы */}
        <path d="M42 54l8 10 8-10" stroke="#3a4266" strokeWidth="2" fill="none" />
        <path d="M50 64v28" stroke="#3a4266" strokeWidth="1.2" />
        <circle cx="50" cy="72" r="1.2" fill="#6c8cff" /><circle cx="50" cy="80" r="1.2" fill="#6c8cff" />
        <rect x="31" y="66" width="9" height="5" rx="1" fill="#6c8cff" opacity=".6" />
        <path d="M37 32c0-9 6-15 13-15s13 6 13 15v4c0 9-6 15-13 15s-13-6-13-15z" fill="#141826" />
        <path d="M35 24c2-6 8-10 15-10s13 4 15 10H35z" fill="#1f2540" />
        <rect x="34" y="23" width="32" height="3" rx="1.5" fill="#2a3150" />
      </g>
      <circle cx="50" cy="36" r="15" fill={`url(#${id}g)`} className={s.glowSoft} />
    </Frame>
  );
});

/* 7. Куратор — мантия, маска с прорезями, «дышит» */
export const CuratorSVG = memo(function CuratorSVG(p: CharProps) {
  const id = useSvgId();
  return (
    <Frame {...p} label="Куратор">
      <defs>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a0207" />
          <stop offset=".35" stopColor="#8b1a2a" />
          <stop offset=".65" stopColor="#8b1a2a" />
          <stop offset="1" stopColor="#1a0207" />
        </linearGradient>
        <radialGradient id={`${id}s`}>
          <stop offset="0" stopColor="#fff" />
          <stop offset=".4" stopColor="#ff5d73" />
          <stop offset="1" stopColor="#ff5d73" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="97" rx="30" ry="3" fill="#000" opacity=".55" />
      <g className={s.breathe}>
        <path d="M50 4c-14 0-20 12-20 24 0 8-6 18-10 32L12 98h76l-8-38c-4-14-10-24-10-32C70 16 64 4 50 4z" fill={`url(#${id}r)`} />
        <path d="M38 40l-6 56M62 40l6 56M50 46v50" stroke="#000" strokeWidth="2.5" opacity=".45" />
        {/* капюшон и маска */}
        <path d="M33 30c0-14 8-22 17-22s17 8 17 22c-5-4-11-6-17-6s-12 2-17 6z" fill="#3a0610" />
        <path d="M39 28c0-7 5-12 11-12s11 5 11 12v8c0 7-5 12-11 12s-11-5-11-12z" fill="#e7dcd0" />
        <path d="M39 30c4 2 7 2 11 2s7 0 11-2" stroke="#b8aa9b" strokeWidth=".8" fill="none" />
        <path d="M42.5 32h5M52.5 32h5" stroke="#1a0207" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M50 38v5" stroke="#b8aa9b" strokeWidth=".8" />
      </g>
      <g className={s.glowSoft}>
        <ellipse cx="45" cy="32" rx="5" ry="3" fill={`url(#${id}s)`} />
        <ellipse cx="55" cy="32" rx="5" ry="3" fill={`url(#${id}s)`} />
      </g>
    </Frame>
  );
});

/* 8. Начальник — наушники с микрофоном */
export const BossHeadphonesSVG = memo(function BossHeadphonesSVG(p: CharProps) {
  return (
    <Frame {...p} label="Начальник">
      <circle cx="50" cy="52" r="40" fill="#ffd166" opacity=".08" />
      <path d="M20 58V48a30 30 0 0 1 60 0v10" stroke="#2d3748" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M20 50a30 30 0 0 1 60 0" stroke="#ffd166" strokeWidth="2" fill="none" opacity=".7" />
      <rect x="10" y="50" width="18" height="28" rx="7" fill="#2d3748" stroke="#ffd166" strokeWidth="2" />
      <rect x="72" y="50" width="18" height="28" rx="7" fill="#2d3748" stroke="#ffd166" strokeWidth="2" />
      <path d="M19 74c0 12 10 16 24 16" stroke="#4a5568" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="41" y="85" width="12" height="8" rx="4" fill="#ffd166" />
      <circle cx="84" cy="56" r="2" fill="#ff5d73" className={s.blink} />
    </Frame>
  );
});

/* 9. Оригинал — ржавый робот, кривая антенна, один глаз потух */
export const OriginalRobotSVG = memo(function OriginalRobotSVG(p: CharProps) {
  const id = useSvgId();
  return (
    <Frame {...p} label="Оригинал">
      <defs>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a5a3c" />
          <stop offset="1" stopColor="#4a2e1f" />
        </linearGradient>
        <radialGradient id={`${id}e`}>
          <stop offset="0" stopColor="#ffd166" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffd166" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="94" rx="28" ry="4" fill="#000" opacity=".5" />
      <rect x="26" y="56" width="48" height="34" rx="6" fill={`url(#${id}r)`} stroke="#2b1a10" strokeWidth="1.5" />
      <circle cx="36" cy="66" r="4" fill="#b3733f" opacity=".7" />
      <circle cx="62" cy="80" r="5" fill="#5c7a5c" opacity=".5" />
      <path d="M40 74h20M40 79h14" stroke="#2b1a10" strokeWidth="1.5" />
      <rect x="18" y="62" width="8" height="18" rx="3" fill="#6b4530" />
      <rect x="74" y="66" width="8" height="16" rx="3" fill="#6b4530" transform="rotate(14 78 74)" />
      <rect x="24" y="20" width="52" height="36" rx="8" fill={`url(#${id}r)`} stroke="#2b1a10" strokeWidth="1.5" />
      <circle cx="66" cy="26" r="3.5" fill="#b3733f" opacity=".8" />
      <circle cx="30" cy="50" r="2.5" fill="#5c7a5c" opacity=".6" />
      <path d="M58 46l6 4-3 2" stroke="#2b1a10" strokeWidth="1" fill="none" />
      {/* глаза: левый горит, правый потух и треснут */}
      <circle cx="39" cy="38" r="10" fill={`url(#${id}e)`} className={s.glowSoft} />
      <circle cx="39" cy="38" r="5" fill="#ffd166" />
      <circle cx="61" cy="38" r="5" fill="#1a120c" stroke="#2b1a10" strokeWidth="1.2" />
      <path d="M58 35l3 3 1 4" stroke="#3a2a1e" strokeWidth=".8" fill="none" />
      <path d="M44 49h12" stroke="#2b1a10" strokeWidth="2" strokeLinecap="round" />
      {/* кривая антенна */}
      <path d="M50 20V12l6-4 2 4" stroke="#8a5a3c" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="58" cy="12" r="2.5" fill="#4a2e1f" />
    </Frame>
  );
});

/* Призрак (для событий ур. 4+) */
export const GhostSVG = memo(function GhostSVG(p: CharProps) {
  return (
    <Frame {...p} label="Призрак">
      <g className={s.flicker}>
        <path d="M22 92V44a28 28 0 0 1 56 0v48l-9-7-9 7-10-7-10 7-9-7z" fill="#c86bff" opacity=".35" />
        <path d="M22 92V44a28 28 0 0 1 56 0v48l-9-7-9 7-10-7-10 7-9-7z" stroke="#e5c2ff" strokeWidth="1.5" fill="none" opacity=".7" />
        <ellipse cx="40" cy="46" rx="5" ry="7" fill="#1a0b2a" />
        <ellipse cx="60" cy="46" rx="5" ry="7" fill="#1a0b2a" />
        <ellipse cx="50" cy="64" rx="6" ry="4" fill="#1a0b2a" />
      </g>
    </Frame>
  );
});

/* Союзник — тёплый огонёк */
export const AllySVG = memo(function AllySVG(p: CharProps) {
  const id = useSvgId();
  return (
    <Frame {...p} label="Союзник">
      <defs>
        <radialGradient id={`${id}a`}>
          <stop offset="0" stopColor="#fff" />
          <stop offset=".3" stopColor="#3ddc97" />
          <stop offset="1" stopColor="#3ddc97" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill={`url(#${id}a)`} className={s.pulse} />
      <path d="M50 30l4 14 14 4-14 4-4 14-4-14-14-4 14-4z" fill="#fff" opacity=".9" />
    </Frame>
  );
});

export const CHARACTER_SVGS = {
  villain: VillainSVG,
  robotKitten: RobotKittenSVG,
  whisper: WhisperSVG,
  misha: MishaSVG,
  ex: ExSVG,
  shadow: ShadowSVG,
  curator: CuratorSVG,
  boss: BossHeadphonesSVG,
  original: OriginalRobotSVG,
} as const;
