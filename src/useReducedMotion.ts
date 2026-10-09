import { useSyncExternalStore } from 'react';

const query = window.matchMedia('(prefers-reduced-motion: reduce)');
const subscribe = (notify: () => void) => {
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};
const snapshot = () => query.matches;

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot);
}
