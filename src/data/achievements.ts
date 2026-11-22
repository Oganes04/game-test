import type { IconName } from '../components/svg/Icons';
import type { EndingId, LevelProgress, Stats, StoryFlags } from './types';

export interface AchCtx {
  story: StoryFlags;
  stats: Stats;
  coins: number;
  levelProgress: Record<number, LevelProgress>;
  endings: EndingId[];
  purchasedAny: boolean;
  /** Результаты только что сыгранной смены, если есть. */
  run?: { levelId: number; win: boolean; maxCombo: number; stars: number; lives: number; ordersSabotaged: number };
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: IconName;
  check: (c: AchCtx) => boolean;
}

const done = (c: AchCtx, id: number) => !!c.levelProgress[id]?.completed;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_shift', title: 'Первая смена', desc: 'Пройди уровень 1', icon: 'check', check: (c) => done(c, 1) },
  { id: 'kind_heart', title: 'Доброе сердце', desc: 'Помоги Грустному злодею', icon: 'heart', check: (c) => c.story.sad_villain === 'saved' },
  { id: 'by_the_book', title: 'По инструкции', desc: 'Отправь злодея в Опасное', icon: 'book', check: (c) => c.story.sad_villain === 'rules' },
  { id: 'memory_keeper', title: 'Хранитель памяти', desc: 'Забери чип у робота-котёнка', icon: 'chip', check: (c) => c.story.robot_kitten === 'memory' },
  { id: 'listener', title: 'Слушатель', desc: 'Выслушай Шёпота', icon: 'chat', check: (c) => c.story.whisper === 'listened' },
  { id: 'informant', title: 'Осведомитель', desc: 'Донеси на Шёпота', icon: 'headphones', check: (c) => c.story.whisper === 'reported' || c.story.whisper5 === 'reported' },
  { id: 'combo5', title: 'Конвейерный ритм', desc: 'Набери комбо ×5', icon: 'bolt', check: (c) => (c.run?.maxCombo ?? 0) >= 5 },
  { id: 'perfect', title: 'Идеальная смена', desc: 'Пройди уровень на 3 звезды', icon: 'star', check: (c) => Object.values(c.levelProgress).some((p) => p.stars === 3) },
  { id: 'obedient', title: 'Исполнительный', desc: 'Выполни 5 приказов Начальника', icon: 'headphones', check: (c) => c.stats.totalOrders >= 5 },
  { id: 'rebel', title: 'Саботажник', desc: 'Сорви 5 приказов', icon: 'flame', check: (c) => c.stats.sabotagedOrders >= 5 },
  { id: 'lasso_master', title: 'Ковбой Бюро', desc: 'Используй Лассо 20 раз', icon: 'lasso', check: (c) => c.stats.lassoUsed >= 20 },
  { id: 'shopper', title: 'Снабжение', desc: 'Купи что-нибудь в магазине', icon: 'shop', check: (c) => c.purchasedAny },
  { id: 'rich', title: 'Премия', desc: 'Накопи 200 монет', icon: 'coin', check: (c) => c.coins >= 200 },
  { id: 'father_son', title: 'Отец и сын', desc: 'Отдай чип Мише', icon: 'child', check: (c) => c.story.misha === 'chip' },
  { id: 'closure', title: 'Недосказанное', desc: 'Поговори с Ней', icon: 'moon', check: (c) => c.story.ex === 'talked' },
  { id: 'shadow_free', title: 'Сомнение', desc: 'Освободи Тень Куратора', icon: 'orb', check: (c) => c.story.shadow === 'freed' },
  { id: 'void_walker', title: 'Сквозь Пустоту', desc: 'Пройди уровень 9', icon: 'ghost', check: (c) => done(c, 9) },
  { id: 'original', title: 'Оригинал', desc: 'Забери прототип из Пустоты', icon: 'target', check: (c) => c.story.originalRobot === 'taken' },
  { id: 'first_ending', title: 'Конец смены', desc: 'Получи любую концовку', icon: 'trophy', check: (c) => c.endings.length >= 1 },
  { id: 'all_endings', title: 'Все двери', desc: 'Открой все 6 концовок', icon: 'spiral', check: (c) => c.endings.length >= 6 },
];

export const ACHIEVEMENT_COINS = 15;
