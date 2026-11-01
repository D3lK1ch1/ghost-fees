// Art for The Ghosts of Christmas theme. Files live in public/themes/christmas.
// Two seasons: Winter (northern) and Summer (Aussie Christmas).
import { avatarKey } from './exArt';

const ART = '/themes/christmas';

export const SEASON_KEY = 'ghostFees.christmasSeason';
export const SEASONS = ['winter', 'summer'];
export const SEASON_LABELS = { winter: 'Winter', summer: 'Summer' };

export const XMAS = {
  room: (season) => `${ART}/xc-room-${season}.webp`,
  sleeper: (season) => `${ART}/xc-sleeper-${season}.webp`,
  morning: (season) => `${ART}/xc-morning-${season}.webp`,
  jacob: `${ART}/xc-jacob-weary.webp`,
  dusty: `${ART}/xc-dusty.webp`,
  jolly: `${ART}/xc-jolly.webp`,
  hooded: `${ART}/xc-hooded.webp`,
};

// Each subscription is one link in Jacob's chain, with a festive avatar.
export function xmasAvatar(merchant, season) {
  return `${ART}/xav-${season === 'summer' ? 's' : 'w'}-${avatarKey(merchant)}.webp`;
}
