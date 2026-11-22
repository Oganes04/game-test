import { motion } from 'framer-motion';
import { Modal } from './Modal';
import { Icon } from './svg/Icons';
import { CHARACTER_SVGS } from './svg/Characters';
import { CHARACTERS } from '../data/characters';
import type { Beat } from '../data/dilemmas';
import ui from '../styles/ui.module.css';
import s from './CharacterModal.module.css';

interface Props {
  beat: Beat;
  onDone: () => void;
}

/** Сюжетная сцена без выбора: реплики персонажей. */
export function CharacterModal({ beat, onDone }: Props) {
  const Main = CHARACTER_SVGS[beat.character];
  return (
    <Modal tone="void" onClose={onDone} label={CHARACTERS[beat.character].name}>
      <div className={s.hero}>
        <Main size={120} />
      </div>
      <div className={s.lines}>
        {beat.lines.map((l, i) => {
          const Who = l.who ? CHARACTER_SVGS[l.who] : null;
          return (
            <motion.div
              key={i}
              className={`${s.line} ${Who ? s.speech : s.narration}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.35 }}
            >
              {Who && l.who && (
                <span className={s.avatar} style={{ borderColor: CHARACTERS[l.who].color }}>
                  <Who size={34} />
                </span>
              )}
              <div>
                {l.who && (
                  <div className={s.who} style={{ color: CHARACTERS[l.who].color }}>
                    {CHARACTERS[l.who].name}
                  </div>
                )}
                <p>{l.text}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      <button className={`${ui.btn} ${ui.primary} ${ui.block}`} onClick={onDone}>
        Продолжить смену <Icon name="arrow" size={18} />
      </button>
    </Modal>
  );
}
