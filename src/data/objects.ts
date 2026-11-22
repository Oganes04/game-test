import type { Category, ObjectDef } from './types';

const o = (id: string, name: string, cat: Category): ObjectDef => ({ id, name, cat });

export const OBJECTS: ObjectDef[] = [
  // Обычное
  o('teddy', 'Мишка', 'common'), o('book', 'Книга', 'common'), o('cup', 'Кружка', 'common'),
  o('flower', 'Цветок', 'common'), o('apple', 'Яблоко', 'common'), o('letter', 'Письмо', 'common'),
  o('umbrella', 'Зонт', 'common'), o('hat', 'Шляпа', 'common'), o('key', 'Ключ', 'common'),
  o('clock', 'Часы', 'common'), o('photo', 'Фото', 'common'), o('ball', 'Мяч', 'common'),
  o('sock', 'Носок', 'common'), o('candle', 'Свеча', 'common'),
  // Техника
  o('gear', 'Шестерня', 'tech'), o('battery', 'Батарея', 'tech'), o('chip', 'Микросхема', 'tech'),
  o('bulb', 'Лампа', 'tech'), o('phone', 'Телефон', 'tech'), o('radio', 'Радио', 'tech'),
  o('plug', 'Вилка', 'tech'), o('screw', 'Винт', 'tech'), o('antenna', 'Антенна', 'tech'),
  o('monitor', 'Монитор', 'tech'), o('cassette', 'Кассета', 'tech'), o('wrench', 'Гаечный ключ', 'tech'),
  // Опасное
  o('bomb', 'Бомба', 'danger'), o('poison', 'Яд', 'danger'), o('fire', 'Огонь', 'danger'),
  o('radiation', 'Радиация', 'danger'), o('lightning', 'Разряд', 'danger'), o('spider', 'Паук', 'danger'),
  o('dynamite', 'Динамит', 'danger'), o('acid', 'Кислота', 'danger'), o('saw', 'Пила', 'danger'),
  o('blade', 'Лезвие', 'danger'), o('virus', 'Вирус', 'danger'), o('mine', 'Мина', 'danger'),
  // Понятия (ур. 10)
  o('love', 'Любовь', 'keep'), o('hope', 'Надежда', 'keep'), o('memory', 'Память', 'keep'),
  o('regret', 'Сожаление', 'release'), o('fear', 'Страх', 'release'), o('guilt', 'Вина', 'release'),
  o('emptiness', 'Пустота', 'erase'), o('anger', 'Гнев', 'erase'), o('oblivion', 'Забвение', 'erase'),
];

export const OBJECT_BY_ID: Record<string, ObjectDef> = Object.fromEntries(OBJECTS.map((x) => [x.id, x]));

export const QUESTION_DEF: ObjectDef = { id: 'question', name: 'Вопрос', cat: 'keep' };
export const SHADOW_DEF: ObjectDef = { id: 'shadowTwin', name: '???', cat: 'danger' };

export const CATEGORY_LABEL: Record<Category, string> = {
  common: 'Обычное',
  tech: 'Техника',
  danger: 'Опасное',
  keep: 'Хранить',
  release: 'Отпустить',
  erase: 'Стереть',
};

/** Цвет категории (для контейнеров и подложки объектов). */
export const CATEGORY_COLOR: Record<Category, string> = {
  common: '#6c8cff',
  tech: '#a86bff',
  danger: '#ff5d73',
  keep: '#ffd166',
  release: '#9fb4ff',
  erase: '#c86bff',
};

export const idsOf = (...cats: Category[]) => OBJECTS.filter((x) => cats.includes(x.cat)).map((x) => x.id);
