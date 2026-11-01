// All theme copy and colours live here. Themes change words, colours and the
// little story only. They never change features or numbers.
// Colours are HSL triples for the CSS variables in index.css.

export const THEMES = {
  haunted: {
    key: 'haunted',
    label: 'Haunted House',
    emoji: '👻',
    headline: 'Find the ghosts haunting your bank account.',
    subhead: 'Ghost Fees finds 8 kinds of money leak and shows the exact dollars, with the transactions behind every one.',
    vars: null, // the default look in index.css
  },
  ex: {
    key: 'ex',
    label: 'My Ex Ghosted Me',
    emoji: '💔',
    headline: 'They ghosted you. Now ghost them back.',
    subhead: 'Your subscriptions said they would change. They raised their prices instead.',
    storyTitle: 'Unread messages from your exes',
    // Lines matched on merchant name. Kind jokes only, never about the user.
    lines: [
      { match: /NETFLIX/i, text: "It's not you, it's my price rise." },
      { match: /\bSTAN\b/i, text: "I've changed! (I raised my prices again.)" },
      { match: /GYM|FITNESS|FITLIFE|ANYTIME|GOODLIFE|JETTS|F45/i, text: "You never visit anymore. I still bill you though." },
      { match: /SPOTIFY|MUSIC/i, text: "Remember our song? It's $14.99 a month now." },
      { match: /ADOBE|CANVA/i, text: "We were so creative together. Every month." },
      { match: /ICLOUD|APPLE|GOOGLE|DROPBOX/i, text: "I'm keeping all your photos. And your money." },
    ],
    fallbackLine: "Hey stranger. Still paying for me?",
    outro: (yearly) => `Cut them loose and that's ${yearly} a year back for brunch, travel or your savings.`,
    // Charcoal page with a limited pink: pink only on the main button and the
    // key dollar figure. Mint is reserved for good news.
    decor: 'none', // no moon or bats here; those belong to Haunted
    vars: {
      '--background': '334 46% 13%',
      '--foreground': '320 20% 98%',
      '--card': '334 38% 18%',
      '--card-foreground': '320 20% 98%',
      '--popover': '334 38% 17%',
      '--popover-foreground': '320 20% 98%',
      '--primary': '354 100% 72%',
      '--primary-foreground': '334 46% 11%',
      '--secondary': '334 32% 22%',
      '--secondary-foreground': '320 20% 98%',
      '--muted': '334 32% 20%',
      '--muted-foreground': '330 30% 86%',
      '--accent': '334 32% 24%',
      '--accent-foreground': '320 20% 98%',
      '--border': '334 30% 30%',
      '--input': '334 30% 26%',
      '--ring': '354 100% 72%',
    },
  },
  christmas: {
    key: 'christmas',
    label: 'Ghosts of Christmas',
    emoji: '🎄',
    headline: 'The Ghosts of Subscriptions Past, Present and Future.',
    subhead: 'Three ghosts will visit you tonight. They will show you what you have lost, what you pay now, and what is coming if nothing changes.',
    storyTitle: 'Three ghosts visit',
    ghosts: [
      { key: 'past', name: 'Ghost of Fees Past', emoji: '🕯️', caption: 'already lost to the leaks in your statement' },
      { key: 'present', name: 'Ghost of Subscriptions Present', emoji: '🎁', caption: 'a month, charging right now' },
      { key: 'future', name: 'Ghost of Subscriptions Yet to Come', emoji: '⏳', caption: 'over the next 12 months if nothing changes' },
    ],
    outro: 'Wake up. It is not too late to change the ending.',
    vars: {
      '--background': '150 45% 9%',
      '--card': '150 35% 13%',
      '--popover': '150 35% 12%',
      '--primary': '43 90% 60%',
      '--primary-foreground': '150 50% 7%',
      '--secondary': '150 28% 18%',
      '--muted': '150 28% 16%',
      '--muted-foreground': '140 15% 74%',
      '--accent': '352 50% 28%',
      '--accent-foreground': '40 40% 96%',
      '--border': '352 55% 42%',
      '--input': '352 30% 30%',
      '--ring': '352 72% 56%',
    },
  },
};

export const THEME_LIST = Object.values(THEMES);
export const DEFAULT_THEME = 'ex';