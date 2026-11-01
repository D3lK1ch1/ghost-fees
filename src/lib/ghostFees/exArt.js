// Art for the My Ex Ghosted Me theme. Files live in public/themes/ex.
// Two ghosts to pick from: Heartbroken (her pick) and I'm Fine (his pick).

const ART = '/themes/ex';

export const EX_GHOST_KEY = 'ghostFees.exGhost';
export const EX_GHOSTS = ['fine', 'heartbroken']; // display order, as in the design

export const EX_SHOUT_BUBBLE = `${ART}/bubble-shout.webp`;

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
    // Story mode art and lines, one per scene in the design.
    scan: `${ART}/ghost-focused.webp`,
    scanBubble: 'Deep breath. Show me.',
    moving: `${ART}/ghost-sassy.webp`,
    movingBubble: ['F**k my ex.', "I'm building a better life."],
    healed: `${ART}/ghost-happy.webp`,
    healedBubble: 'Healing era.',
    clear: `${ART}/ghost-dinner.webp`,
    clearBubble: 'Table for me. My exes are paying.',
    clearUnlock: 'Dinner out',
    house: `${ART}/ghost-sad.webp`,
    houseBubble: 'They all ghosted me...',
    // Act 2 and the results tabs, from design screens Ex8 to Ex11 and Ex6.
    backShout: 'New phone. Who dis?',
    planTitle: 'Your better-life plan',
    weekendTag: 'Act 2 · Month 6',
    weekendTitle: 'Weekend away: funded.',
    planLabels: ['Brunch', 'Dinner out', 'Weekend away', 'Savings'],
    splurgeTitle: ['What your exes ', 'paid for'],
    splurgeSub: 'Healing looks good on you.',
    splurge: [
      { label: 'Dinner out', art: `${ART}/ghost-dinner.webp` },
      { label: 'Rosé with the girls', art: `${ART}/avatars/pf-rose.webp` },
      { label: 'New outfit', art: `${ART}/ghost-sassy.webp` },
      { label: 'Weekend away', art: `${ART}/ghost-happy.webp` },
    ],
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
    scan: `${ART}/men-shaker.webp`,
    scanBubble: 'Probably nothing. Show me.',
    moving: `${ART}/men-lift.webp`,
    movingBubble: ['F**k my ex.', "I'm building a better life."],
    healed: `${ART}/men-block.webp`,
    healedBubble: 'Watch this.',
    clear: `${ART}/men-bbqshades.webp`,
    clearBubble: "BBQ's on the exes.",
    clearUnlock: 'BBQ',
    house: `${ART}/men-couch.webp`,
    houseBubble: "I'm fine. They all left.",
    backShout: 'Mid-game. Who dis?',
    planTitle: 'The power-on plan',
    weekendTag: 'Act 2 · Month 6 · Gone fishing',
    weekendTitle: 'Fishing trip: funded.',
    weekendArt: `${ART}/men-fish.webp`,
    planLabels: ['Footy tickets', 'New kicks', 'Fishing trip', 'Savings goal'],
    splurgeTitle: ['What your exes ', 'paid for'],
    splurgeSub: "Didn't miss them. Didn't even notice.",
    splurge: [
      { label: 'New kicks', art: `${ART}/avatars/pm-kicks.webp`, cover: true },
      { label: 'Footy finals', art: `${ART}/men-footy.webp` },
      { label: 'Fishing trip', art: `${ART}/men-fish.webp`, cover: true },
      { label: 'Weekend BBQ', art: `${ART}/men-bbqshades.webp` },
    ],
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

// Avatars for the exes. Known exes (Netflix, Stan, gym, Adobe, Streammax) keep their
// drawn character from the design. Everyone else gets a photo avatar, one set per
// pick: pink ghosts for Heartbroken, hoodie ghosts for I'm Fine. Every merchant gets its own face (no doubles until
// the set runs out), and the same merchant keeps
// the same face on every screen because the map is built once per results page.
const PHOTO_SETS = {
  heartbroken: ['pf-card', 'pf-phone', 'pf-rose', 'pf-determined', 'pf-sassy', 'pf-shocked', 'pf-sad'],
  fine: ['pm-hoodie', 'pm-block', 'pm-bbq', 'pm-fish', 'pm-couch', 'pm-kicks', 'pm-footy', 'pm-lift', 'pm-shock', 'pm-cap'],
};

export function exAvatarMap(merchants = [], pickKey = 'heartbroken') {
  const pool = PHOTO_SETS[pickKey] || PHOTO_SETS.heartbroken;
  const map = new Map();
  const used = new Set();
  let next = 0;
  merchants.forEach((merchant) => {
    if (!merchant || map.has(merchant)) return;
    // Known exes keep their drawn character from the design.
    if (avatarKey(merchant) !== 'more') {
      map.set(merchant, exAvatar(merchant));
      return;
    }
    const free = pool.find((name) => !used.has(name));
    const file = free || pool[next % pool.length];
    next += 1;
    used.add(file);
    map.set(merchant, `${ART}/avatars/${file}.webp`);
  });
  return (merchant) => map.get(merchant) || exAvatar(merchant);
}
