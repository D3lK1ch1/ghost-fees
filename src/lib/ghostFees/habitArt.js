import { EX_GHOST_KEY } from './exArt';

// Hattie and Hank, the habit ghosts (Pack 10). Which sticker shows for each theme and
// pose. A missing pose falls back to that theme's main sticker, then to default Hattie,
// so an image never breaks. Celebrate poses: add `celebrate:` keys here when they exist.
const BASE = '/themes/habit/';
export const HABIT_FALLBACK = `${BASE}hattie-main.webp`;
const FILES = {
  haunted: { main: 'hattie-haunted-main', checkin: 'hattie-haunted-checkin' },
  heartbroken: { main: 'hattie-ex-heartbroken-main' },
  fine: { main: 'hank-ex-fine-main' },
  christmas: { main: 'hattie-xmas-main', checkin: 'hattie-xmas-checkin' },
};

// theme: 'haunted' | 'ex' | 'christmas'; exPick: 'heartbroken' | 'fine'
export function habitArtKey(theme, exPick) {
  if (theme === 'ex') return exPick === 'fine' ? 'fine' : 'heartbroken';
  return FILES[theme] ? theme : 'haunted';
}

// pose: 'main' | 'checkin' | 'celebrate'
export function habitArt(theme, exPick, pose = 'main') {
  const set = FILES[habitArtKey(theme, exPick)] || {};
  const file = set[pose] || set.main;
  return file ? `${BASE}${file}.webp` : HABIT_FALLBACK;
}

export function habitGhost(theme, exPick) {
  const isHank = theme === 'ex' && exPick === 'fine';
  if (isHank) return { name: 'Hank', role: 'the habit ghost', hank: true };
  return { name: 'Hattie', role: theme === 'ex' ? 'your glow-up coach' : theme === 'christmas' ? 'keeper of resolutions' : 'the habit ghost', hank: false };
}

// The Ex theme's "Choose your ghost" pick, as saved by ExHero. Heartbroken if none yet.
export function readExPick() {
  try {
    return window.localStorage.getItem(EX_GHOST_KEY) === 'fine' ? 'fine' : 'heartbroken';
  } catch {
    return 'heartbroken';
  }
}

// <img> props for a habit sticker: alt, 512 size, lazy, and a fallback on error.
export function habitImgProps(theme, exPick, pose = 'main') {
  const ghost = habitGhost(theme, exPick);
  return {
    src: habitArt(theme, exPick, pose),
    alt: `${ghost.name}, ${ghost.role}`,
    width: 512,
    height: 512,
    loading: 'lazy',
    onError: (event) => {
      if (!event.currentTarget.src.endsWith(HABIT_FALLBACK)) event.currentTarget.src = HABIT_FALLBACK;
    },
  };
}
