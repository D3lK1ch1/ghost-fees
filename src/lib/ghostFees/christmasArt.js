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
  jacob: `${ART}/xc-jacob-weary-v2.webp`, // from Image Assets: Jacob Ledger's Receipt Relief
  awake: `${ART}/xc-sleeper-awake.webp`, // Image Assets: Cute Sleeper Trio, the surprise awakening
  jacobFree: `${ART}/xc-jacob-free-v2.webp`, // the same sheet: Jacob once every link is broken
  dusty: `${ART}/xc-dusty.webp`,
  jolly: `${ART}/xc-jolly.webp`,
  hooded: `${ART}/xc-hooded.webp`,
};

// Each subscription is one link in Jacob's chain, with a festive avatar.
export function xmasAvatar(merchant, season) {
  return `${ART}/xav-${season === 'summer' ? 's' : 'w'}-${avatarKey(merchant)}.webp`;
}

// Who each festive ghost is, for the tap-for-popup on every card (3 Nov: "each ghost
// needs a description and popup"). Same keys as the avatars above.
export const XMAS_GHOSTS = {
  netflix: { name: 'Popcorn Pete', who: 'The binge-watcher in the Christmas jumper. He haunts the streaming you keep paying for after the show ends.' },
  stan: { name: 'Tangled Tinsel', who: 'Wrapped up in fairy lights and grumpy about it. She haunts the subscriptions that are easy to start and fiddly to leave.' },
  gym: { name: 'Sweaty Holly', who: 'Holding a dumbbell and a candy cane, mostly the candy cane. Haunts the membership you pay for but skip.' },
  adobe: { name: 'Cool Yule', who: 'Too cool to unwrap the present. Haunts design and software tools, often paid twice.' },
  streammax: { name: 'Frosty', who: 'A chilly little ghost with a scarf and mistletoe. Haunts free trials that quietly turned paid, and streaming add-ons.' },
  more: { name: 'Mystery Parcel', who: 'A gift you never asked for. Haunts bank fees, price rises and charges you didn\'t expect.' },
};

export function xmasGhost(merchant) {
  return XMAS_GHOSTS[avatarKey(merchant)] || XMAS_GHOSTS.more;
}
