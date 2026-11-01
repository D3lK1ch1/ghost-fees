// Art for the My Ex Ghosted Me theme. Files live in public/themes/ex.
// Two ghosts to pick from: Heartbroken (her pick) and I'm Fine (his pick).

const ART = '/themes/ex';

export const EX_GHOST_KEY = 'ghostFees.exGhost';
export const EX_GHOSTS = ['fine', 'heartbroken']; // display order, as in the design

export const EX_PICKS = {
  heartbroken: {
    label: 'Heartbroken',
    note: 'Her pick',
    avatar: `${ART}/pfp-heartbroken.webp`,
    hero: `${ART}/ghost-sad.webp`,
    heroAlt: 'A sad pink ghost in bed, looking at her phone',
    heroBubble: "They said they'd change...",
    headline: ['They ghosted you. ', 'Now', 'ghost them back.'],
    shocked: `${ART}/ghost-shocked.webp`,
    shout: 'Wait. ALL of them?!',
    done: `${ART}/ghost-sassy.webp`,
  },
  fine: {
    label: "I'm Fine",
    note: 'His pick',
    avatar: `${ART}/pfp-fine.webp`,
    hero: `${ART}/men-cap.webp`,
    heroAlt: 'A ghost in a cap, sipping a drink and looking at his phone',
    heroBubble: "I'm fine. Totally fine.",
    headline: ['They ghosted you. ', "You're", 'fine. Totally fine.'],
    shocked: `${ART}/men-shock.webp`,
    shout: 'Mate. ALL of them?!',
    done: `${ART}/men-block.webp`,
  },
};

// One small avatar per ex, matched on the merchant name.
const AVATARS = [
  { match: /NETFLIX/i, key: 'netflix' },
  { match: /\bSTAN\b/i, key: 'stan' },
  { match: /GYM|FITNESS|FITLIFE|ANYTIME|GOODLIFE|JETTS|F45/i, key: 'gym' },
  { match: /ADOBE|CANVA/i, key: 'adobe' },
  { match: /STREAMMAX|DISNEY|BINGE|PARAMOUNT|PRIME VIDEO|YOUTUBE/i, key: 'streammax' },
];

// Which ex avatar fits this merchant: netflix, stan, gym, adobe, streammax or more.
export function avatarKey(merchant = '') {
  return AVATARS.find((item) => item.match.test(merchant))?.key || 'more';
}

export function exAvatar(merchant = '') {
  return `${ART}/exav-${avatarKey(merchant)}.webp`;
}

// Photo avatars for the exes, one set per pick: pink ghosts for Heartbroken,
// hoodie ghosts for I'm Fine. Every merchant gets its own face (no doubles until
// the set runs out), bank fees get the piggy bank, and the same merchant keeps
// the same face on every screen because the map is built once per results page.
const PHOTO_SETS = {
  heartbroken: ['pf-card', 'pf-phone', 'pf-rose', 'pf-determined', 'pf-sassy', 'pf-shocked', 'pf-sad'],
  fine: ['pm-hoodie', 'pm-block', 'pm-bbq', 'pm-fish', 'pm-couch', 'pm-kicks', 'pm-footy', 'pm-lift', 'pm-shock', 'pm-cap'],
};
const FEE_RE = /\bFEE\b|\bFEES\b|INTEREST|\bATM\b|OVERDRAWN|DISHONOUR/i;

export function exAvatarMap(merchants = [], pickKey = 'heartbroken') {
  const pool = PHOTO_SETS[pickKey] || PHOTO_SETS.heartbroken;
  const map = new Map();
  const used = new Set();
  let next = 0;
  merchants.forEach((merchant) => {
    if (!merchant || map.has(merchant)) return;
    let file;
    if (FEE_RE.test(merchant) && !used.has('pf-piggy')) {
      file = 'pf-piggy';
    } else {
      const free = pool.find((name) => !used.has(name));
      file = free || pool[next % pool.length];
      next += 1;
    }
    used.add(file);
    map.set(merchant, `${ART}/avatars/${file}.webp`);
  });
  return (merchant) => map.get(merchant) || exAvatar(merchant);
}
