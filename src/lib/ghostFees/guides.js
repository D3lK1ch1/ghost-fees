import { money } from './format';

// Three ghost guides, each with their own colour and job. They change the tone and
// which questions come first, never the facts.
export const GUIDES = {
  penny: {
    name: 'Penny',
    role: 'the tidy accountant',
    color: '#5ee6c8',
    job: 'Fees and totals',
    does: 'Tallies every charge and bank fee, and shows how each total was worked out.',
    chips: ['Which ghost costs the most?', 'What is price creep?', 'Is my data stored?'],
    intro: (count, total) => `${count} ${count === 1 ? 'ghost' : 'ghosts'} on file, ${money(total)} all up. Let's tidy the books, one room at a time.`,
    pick: (leak) => `${leak.title || leak.merchant}: ${money(leak.amount)}, filed under ${leak.badge.toLowerCase()}.`,
    room: (label, count, amount) => `${label}: ${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(amount)} between them. Details are below.`,
    bust: (leak, left) => `${leak.title || leak.merchant} is balanced and filed. ${left} to go.`,
    done: (total) => `Books balanced. ${money(total)} accounted for. Lovely and tidy.`,
  },
  sir: {
    name: 'Sir Spooksworth',
    role: 'the posh old spirit',
    color: '#b18cff',
    job: 'Letters and emails',
    does: 'Writes the polite letters: cancel, refund and fee-waiver emails, ready to send.',
    chips: ['Write my first email', 'Show all email templates', 'Set up reminders'],
    intro: (count, total) => `Good heavens. ${count} uninvited ${count === 1 ? 'guest' : 'guests'}, helping themselves to ${money(total)}.`,
    pick: (leak) => `Ah, ${leak.title || leak.merchant}. A ${leak.badge.toLowerCase()}, costing you ${money(leak.amount)}. Most impertinent.`,
    room: (label, count, amount) => `The ${label.toLowerCase()}. ${count} ${count === 1 ? 'spectre' : 'spectres'} lurking, ${money(amount)} squandered. Dreadful.`,
    bust: (leak, left) => `${leak.title || leak.merchant} has been shown the door. ${left} more to see out.`,
    done: (total) => `The manor is yours again. ${money(total)} of ghostly freeloading, ended.`,
  },
  gus: {
    name: 'Gus',
    role: 'the hype ghost',
    color: '#ff6fa3',
    job: 'Busting your ghosts',
    does: 'Cheers you on, keeps score as you bust ghosts and turns the savings into goals.',
    chips: ['What should I do first?', 'Make my goals', 'Show me the haunted house'],
    intro: (count, total) => `LET'S GO! ${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(total)} on the line. Bust 'em!`,
    pick: (leak) => `${leak.title || leak.merchant}! ${money(leak.amount)} of ${leak.badge.toLowerCase()}. Get it!`,
    room: (label, count, amount) => `${label.toUpperCase()}! ${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(amount)}. Let's clear it!`,
    bust: (leak, left) => `BOOM! ${leak.title || leak.merchant} busted! ${left} left!`,
    done: (total) => `HOUSE CLEARED! ${money(total)} of ghosts, gone! Legend!`,
  },
};

export const GUIDE_KEYS = Object.keys(GUIDES);
