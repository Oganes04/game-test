import type { EndingId, StoryFlags } from './types';
import type { IconName } from '../components/svg/Icons';

export interface Finale {
  id: EndingId;
  title: string;
  icon: IconName;
  color: string;
  paragraphs: string[];
}

export const FINALES: Record<EndingId, Finale> = {
  bureaucrat: {
    id: 'bureaucrat', title: 'Бюрократ', icon: 'headphones', color: '#ffd166',
    paragraphs: [
      '«Я — Бюро».',
      'Ты надеваешь наушники плотнее. Голос Начальника теперь звучит изнутри.',
      'Смена никогда не кончается — и это удобно: не нужно думать. Лента везёт. Ты сортируешь.',
      'Где-то внизу Пустота принимает новых. Шёпота ты больше не слышишь.',
    ],
  },
  savior: {
    id: 'savior', title: 'Спаситель', icon: 'dove', color: '#3ddc97',
    paragraphs: [
      '«Я — выход».',
      'Ты открываешь контейнер «Опасное» — а внутри не пламя, а лестница вниз.',
      'Ты спускаешься и выводишь всех: злодея с котёнком, Мишу, тех, кого называли браком.',
      'Лента впервые за триста лет едет в обратную сторону.',
    ],
  },
  power: {
    id: 'power', title: 'Власть', icon: 'orb', color: '#a86bff',
    paragraphs: [
      '«Я — Бюро».',
      'Тень входит в тебя, как ключ в замок. Куратор медленно снимает маску и протягивает её тебе.',
      'Теперь ты решаешь, что Опасное, а что Обычное.',
      'Ты будешь справедливым. Ты уверен. Пока.',
    ],
  },
  destruction: {
    id: 'destruction', title: 'Разрушение', icon: 'blast', color: '#ff5d73',
    paragraphs: [
      '«Я — выход».',
      'Оригинал вспыхивает единственным глазом. Взрыв рвёт ленту, контейнеры, стены.',
      'Бюро рушится. Свободны все — и никто не знает, куда идти.',
      'В тишине слышно, как где-то мурлычет котёнок.',
    ],
  },
  secret: {
    id: 'secret', title: 'Секрет', icon: 'spiral', color: '#c86bff',
    paragraphs: [
      '«Я — Артём».',
      'Куратор замирает. Шёпот рядом с тобой становится плотным, тёплым, живым. Это не он — это ты.',
      'Тридцать лет назад ты не успел. Миша бежит по ленте, Оригинал скрипит следом.',
      'Бюро — это память, которая боялась любить. На вопрос «зачем» ты наконец отвечаешь вслух:',
      '«Потому что люблю».',
    ],
  },
  nobody: {
    id: 'nobody', title: 'Никто', icon: 'walker', color: '#8a95b8',
    paragraphs: [
      '«Я — никто».',
      'Куратор смотрит сквозь тебя. Никто не может быть сотрудником. Никого нельзя отправить.',
      'Ты снимаешь бейдж и уходишь — мимо ленты, мимо контейнеров, в дверь без таблички.',
      'Никто тебя не останавливает.',
    ],
  },
};

export const ENDING_ORDER: EndingId[] = ['bureaucrat', 'savior', 'power', 'destruction', 'secret', 'nobody'];

/** Определяет концовку по ответу на вопрос «Кто ты?» и флагам сюжета. */
export function resolveEnding(answer: string, s: StoryFlags): EndingId {
  if (answer === 'artem') return 'secret';
  if (answer === 'nobody') return 'nobody';
  if (answer === 'bureau') return s.shadow === 'freed' ? 'power' : 'bureaucrat';
  // «Я — выход»
  if (s.originalRobot === 'weapon') return 'destruction';
  if (s.whisperSaved || s.shadow === 'freed') return 'savior';
  return 'nobody';
}

export const ENDING_COINS = 100;
