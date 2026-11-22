import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal } from './Modal';
import { Icon } from './svg/Icons';
import { CHARACTER_SVGS } from './svg/Characters';
import { CHARACTERS } from '../data/characters';
import type { Dilemma } from '../data/dilemmas';
import ui from '../styles/ui.module.css';
import s from './DilemmaModal.module.css';

interface Props {
  dilemma: Dilemma;
  /** Возвращает текст-ответ персонажа или null, если сразу закрывать. */
  onChoose: (optionId: string) => string | null;
  onDone: () => void;
}

export function DilemmaModal({ dilemma, onChoose, onDone }: Props) {
  const [response, setResponse] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const Char = CHARACTER_SVGS[dilemma.character];
  const With = dilemma.with ? CHARACTER_SVGS[dilemma.with] : null;
  const info = CHARACTERS[dilemma.character];
  const tone = dilemma.character === 'curator' ? 'curator' : dilemma.character === 'whisper' || dilemma.character === 'shadow' ? 'void' : 'default';

  const choose = (id: string) => {
    if (chosen) return;
    setChosen(id);
    const r = onChoose(id);
    if (r) setResponse(r);
  };

  return (
    <Modal tone={tone} label={dilemma.title} onClose={response ? onDone : undefined}>
      <div className={s.stage}>
        <div className={s.glow} style={{ background: `radial-gradient(circle, ${info.color}33, transparent 65%)` }} />
        <Char size={150} />
        {With && (
          <div className={s.with}>
            <With size={54} />
          </div>
        )}
      </div>
      <div className={s.head}>
        <h2 className={s.title}>{dilemma.title}</h2>
        <p className={s.role}>{info.role}</p>
      </div>

      <AnimatePresence mode="wait">
        {!response ? (
          <motion.div key="q" className={s.block} exit={{ opacity: 0, y: -8 }}>
            {dilemma.lines.map((l, i) => (
              <motion.p
                key={i}
                className={s.line}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.25 }}
              >
                {l}
              </motion.p>
            ))}
            <div className={s.options}>
              {dilemma.options.map((o, i) => (
                <motion.button
                  key={o.id}
                  className={`${s.option} ${o.secret ? s.secret : ''} ${chosen === o.id ? s.chosen : ''}`}
                  disabled={!!o.locked || !!chosen}
                  onClick={() => choose(o.id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + dilemma.lines.length * 0.25 + i * 0.08 }}
                >
                  <span className={s.optLabel}>
                    {o.locked && <Icon name="lock" size={14} />}
                    {o.label}
                  </span>
                  {(o.locked || o.hint) && <span className={s.optHint}>{o.locked ?? o.hint}</span>}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="a" className={s.block} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className={`${s.line} ${s.response}`}>{response}</p>
            <button className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={onDone}>
              Продолжить смену <Icon name="arrow" size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
