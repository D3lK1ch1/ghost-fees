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
    pickArt: `${ART}/pink-phone.webp`, // full-body, no circle, for the ghost picker
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
    party: `${ART}/ghost-dinner.webp`,
    partyCrew: ['ghost-dinner', 'ghost-happy', 'ghost-sassy', 'pink-phone'],
    splurge: [
      { label: 'Dinner out', art: `${ART}/ghost-dinner.webp` },
      { label: 'Night out with the girls', art: `${ART}/pink-phone.webp` },
      { label: 'New outfit', art: `${ART}/ghost-sassy.webp` },
      { label: 'Weekend away', art: `${ART}/ghost-happy.webp` },
    ],
  },
  fine: {
    label: "I'm Fine",
    note: 'His pick',
    avatar: `${ART}/pfp-fine.webp`,
    pickArt: `${ART}/men-cap.webp`,
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
    party: `${ART}/men-footy.webp`,
    partyCrew: ['men-footy', 'men-bbqshades', 'men-lift', 'men-cap'],
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

// Exes with their own art from the Image Assets folder: the gym is the ghost lifting
// a barbell. Everyone else uses their ex character from the design.
const OWN_ART = { gym: `${ART}/men-lift.webp` };

export function exAvatar(merchant = '') {
  const key = avatarKey(merchant);
  return OWN_ART[key] || `${ART}/exav-${key}.webp`;
}

// Avatars for the exes: cut-out ghosts, no circle behind them. Known exes (Netflix,
// Stan, gym, Adobe, Streammax) keep their own character from the design. Everyone
// else first gets an ex character nobody is using yet, then a full-body ghost from
// the pick's art. No doubles until the set runs out, and the same merchant keeps
// the same face on every screen because the map is built once per results page.
const EX_KEYS = ['more', 'streammax', 'stan', 'adobe', 'netflix'];
const BODY_SETS = {
  heartbroken: ['pink-phone', 'ghost-shocked', 'ghost-focused', 'ghost-happy', 'ghost-sad', 'ghost-dinner', 'ghost-sassy'],
  fine: ['men-cap', 'men-shaker', 'men-shock', 'men-couch', 'men-footy', 'men-bbqshades', 'men-block'],
};

export function exAvatarMap(merchants = [], pickKey = 'heartbroken') {
  const unique = [...new Set(merchants.filter(Boolean))];
  const map = new Map();
  const usedKeys = new Set(unique.map((merchant) => avatarKey(merchant)).filter((key) => key !== 'more'));
  const freeKeys = EX_KEYS.filter((key) => !usedKeys.has(key));
  const bodies = BODY_SETS[pickKey] || BODY_SETS.heartbroken;
  let body = 0;
  unique.forEach((merchant) => {
    const key = avatarKey(merchant);
    if (key !== 'more') {
      map.set(merchant, exAvatar(merchant));
    } else if (freeKeys.length) {
      map.set(merchant, `${ART}/exav-${freeKeys.shift()}.webp`);
    } else {
      map.set(merchant, `${ART}/${bodies[body % bodies.length]}.webp`);
      body += 1;
    }
  });
  return (merchant) => map.get(merchant) || exAvatar(merchant);
}
