import type { StateStorage } from 'zustand/middleware';

export const SAVE_KEY = 'conveyor-save';

/** localStorage с защитой от приватного режима / переполнения квоты. */
export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* квота или приватный режим — игра продолжится без сохранения */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};
