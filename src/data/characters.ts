import type { CharacterId } from './types';

export interface CharacterInfo {
  id: CharacterId;
  name: string;
  role: string;
  color: string;
}

export const CHARACTERS: Record<CharacterId, CharacterInfo> = {
  villain: { id: 'villain', name: 'Грустный злодей', role: 'Объект категории «Опасное»', color: '#9aa5c8' },
  robotKitten: { id: 'robotKitten', name: 'Робот-котёнок', role: 'Собран из деталей Бюро', color: '#ffd166' },
  whisper: { id: 'whisper', name: 'Шёпот', role: 'Бывший Сортировщик', color: '#c86bff' },
  misha: { id: 'misha', name: 'Миша', role: '9 лет. Ждёт папу', color: '#9fd0ff' },
  ex: { id: 'ex', name: 'Она', role: 'Причина, по которой ты здесь', color: '#d9d2cc' },
  shadow: { id: 'shadow', name: 'Тень Куратора', role: 'То, что он отрезал от себя', color: '#a86bff' },
  curator: { id: 'curator', name: 'Куратор', role: 'Помнит каждого', color: '#ff5d73' },
  boss: { id: 'boss', name: 'Начальник', role: 'Голос в наушнике', color: '#ffd166' },
  original: { id: 'original', name: 'Оригинал', role: 'Прототип робота Артёма', color: '#c98a5a' },
};
