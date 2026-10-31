import { money } from './format';

// Three ghost guides. They only change the tone of short messages, never the facts.
export const GUIDES = {
  penny: {
    name: 'Penny',
    role: 'the tidy accountant',
    color: '#5ee6c8',
    intro: (count, total) => `${count} ${count === 1 ? 'ghost' : 'ghosts'} on file, ${money(total)} all up. Let's tidy the books, one room at a time.`,
    pick: (leak) => `${leak.title || leak.merchant}: ${money(leak.amount)}, filed under ${leak.badge.toLowerCase()}.`,
    bust: (leak, left) => `${leak.title || leak.merchant} is balanced and filed. ${left} to go.`,
    done: (total) => `Books balanced. ${money(total)} accounted for. Lovely and tidy.`,
  },
  sir: {
    name: 'Sir Spooksworth',
    role: 'the posh old spirit',
    color: '#ffc857',
    intro: (count, total) => `Good heavens. ${count} uninvited ${count === 1 ? 'guest' : 'guests'}, helping themselves to ${money(total)}.`,
    pick: (leak) => `Ah, ${leak.title || leak.merchant}. A ${leak.badge.toLowerCase()}, costing you ${money(leak.amount)}. Most impertinent.`,
    bust: (leak, left) => `${leak.title || leak.merchant} has been shown the door. ${left} more to see out.`,
    done: (total) => `The manor is yours again. ${money(total)} of ghostly freeloading, ended.`,
  },
  gus: {
    name: 'Gus',
    role: 'the hype ghost',
    color: '#ff9a3c',
    intro: (count, total) => `LET'S GO! ${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(total)} on the line. Bust 'em!`,
    pick: (leak) => `${leak.title || leak.merchant}! ${money(leak.amount)} of ${leak.badge.toLowerCase()}. Get it!`,
    bust: (leak, left) => `BOOM! ${leak.title || leak.merchant} busted! ${left} left!`,
    done: (total) => `HOUSE CLEARED! ${money(total)} of ghosts, gone! Legend!`,
  },
};

export const GUIDE_KEYS = Object.keys(GUIDES);
