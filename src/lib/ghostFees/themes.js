// All theme copy and colours live here. Themes change words, colours and the
// little story only. They never change features or numbers.
// Colours are HSL triples for the CSS variables in index.css.

export const THEMES = {
  haunted: {
    key: 'haunted',
    label: 'Haunted',
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
    subhead: 'Your subscriptions said they would change. They raised their prices instead. Find every one that is still taking your money.',
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
    vars: {
      '--background': '330 35% 10%',
      '--card': '330 30% 14%',
      '--popover': '330 30% 13%',
      '--primary': '345 90% 68%',
      '--primary-foreground': '330 50% 8%',
      '--secondary': '330 25% 19%',
      '--muted': '330 25% 17%',
      '--muted-foreground': '330 18% 74%',
      '--accent': '330 25% 21%',
      '--border': '330 22% 24%',
      '--input': '330 22% 26%',
      '--ring': '345 90% 68%',
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
      '--accent': '150 28% 20%',
      '--border': '150 22% 22%',
      '--input': '150 22% 24%',
      '--ring': '43 90% 60%',
    },
  },
};

export const THEME_LIST = Object.values(THEMES);
export const DEFAULT_THEME = 'ex';