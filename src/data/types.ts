export type Category = 'common' | 'tech' | 'danger' | 'keep' | 'release' | 'erase';

export interface ObjectDef {
  id: string;
  name: string;
  cat: Category;
}

export type CharacterId =
  | 'villain' | 'robotKitten' | 'whisper' | 'misha' | 'ex'
  | 'shadow' | 'curator' | 'boss' | 'original';

/** Флаги сюжета — сквозные между уровнями. */
export interface StoryFlags {
  sad_villain?: 'rules' | 'saved' | 'used';
  robot_kitten?: 'rules' | 'saved' | 'memory';
  whisper?: 'listened' | 'reported' | 'ignored';
  whisperSaved: boolean;
  whisperListened: boolean;
  whisper5?: 'helped' | 'reported' | 'used';
  curator?: 'defied' | 'obeyed' | 'asked';
  misha?: 'gift' | 'chip' | 'rules';
  ex?: 'talked' | 'sorted' | 'kept';
  shadow?: 'freed' | 'merged' | 'destroyed' | 'passed';
  originalRobot?: 'taken' | 'left' | 'weapon';
  hasChip: boolean;
  curatorWeak: boolean;
}

export type LevelEventKind = 'dilemma' | 'beat';

export interface LevelEvent {
  /** После скольких правильных сортировок срабатывает. */
  at: number;
  kind: LevelEventKind;
  id: string;
  /** belt — персонаж едет по ленте; corner — появляется в углу; final — после цели. */
  mode: 'belt' | 'corner' | 'final';
  /** Событие активно только при условии. */
  when?: (s: StoryFlags) => boolean;
}

export interface LaneDef {
  cats: Category[];
}

export type Scene = 'factory' | 'alarm' | 'grim' | 'personal' | 'void' | 'final';

export interface LevelDef {
  id: number;
  act: number;
  title: string;
  speed: number;
  goal: number;
  /** Секунд на смену. */
  time: number;
  lanes: LaneDef[];
  bins: [Category, Category, Category];
  scene: Scene;
  feature: string;
  orders: number;
  events: LevelEvent[];
  voidObjects?: boolean;
  shadowTwins?: boolean;
  questions?: boolean;
  lightMeter?: boolean;
  /** Пул объектов уровня (id из каталога). */
  pool: string[];
}

export type ToolId =
  | 'lasso' | 'purr' | 'voice' | 'laugh' | 'doubt'
  | 'freeze' | 'magnet' | 'shield' | 'double' | 'eye';

export interface LevelProgress {
  stars: 1 | 2 | 3;
  bestScore: number;
  completed: boolean;
}

export interface Stats {
  totalGames: number;
  totalOrders: number;
  sabotagedOrders: number;
  lassoUsed: number;
  totalSorted: number;
}

export type EndingId = 'bureaucrat' | 'savior' | 'power' | 'destruction' | 'secret' | 'nobody';
