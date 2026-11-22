import type { CharacterId } from './types';
import type { IconName } from '../components/svg/Icons';

export interface IntroCard {
  title: string;
  text: string;
  character?: CharacterId;
  icon?: IconName;
}

export const INTRO_CARDS: IntroCard[] = [
  {
    title: 'Бюро Сортировки',
    text: 'Ты просыпаешься за пультом. Перед тобой — бесконечная лента. На бейдже: «Сортировщик №…» Номер стёрт.',
    icon: 'list',
  },
  {
    title: 'Начальник',
    text: 'В наушнике — голос. «Обычное — к обычному. Техника — к технике. Опасное — в Опасное. Вопросов не задавать».',
    character: 'boss',
  },
  {
    title: 'Правила',
    text: 'Перетащи объект в контейнер — или тапни объект, потом контейнер. Упустишь — минус жизнь. Ошибёшься — перегрев.',
    icon: 'swipe',
  },
  {
    title: 'Куратор',
    text: 'Над цехом — тёмное окно. За стеклом кто-то стоит. Говорят, Куратор никогда не спит. Говорят, он помнит каждого.',
    character: 'curator',
  },
];
