import type { StoryFlags } from '../data/types';

export interface SecretCondition {
  id: string;
  label: string;
  done: (s: StoryFlags) => boolean;
}

/** 7 условий секретного пути. Все нужны, чтобы открыть «Я — Артём». */
export const SECRET_CONDITIONS: SecretCondition[] = [
  { id: 'chip', label: 'Ур. 2: забрать чип у котёнка', done: (s) => s.robot_kitten === 'memory' },
  { id: 'listen', label: 'Ур. 3: выслушать Шёпота', done: (s) => s.whisper === 'listened' },
  { id: 'save', label: 'Ур. 5: спасти Шёпота', done: (s) => s.whisperSaved },
  { id: 'misha', label: 'Ур. 7: отдать чип Мише', done: (s) => s.misha === 'chip' },
  { id: 'ex', label: 'Ур. 7: поговорить с Ней', done: (s) => s.ex === 'talked' },
  { id: 'shadow', label: 'Ур. 8: пройти мимо Тени', done: (s) => s.shadow === 'passed' },
  { id: 'original', label: 'Ур. 9: забрать Оригинала', done: (s) => s.originalRobot === 'taken' },
];

export const secretProgress = (s: StoryFlags) => SECRET_CONDITIONS.filter((c) => c.done(s)).length;
export const isSecretPathComplete = (s: StoryFlags) => SECRET_CONDITIONS.every((c) => c.done(s));
