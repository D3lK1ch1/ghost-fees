import { money } from './format';

// Six ghost guides, each with their own colour and job. They change the tone and
// which questions come first, never the facts.
export const GUIDES = {
  penny: {
    name: 'Penny',
    role: 'the tidy accountant',
    color: '#5ee6c8',
    job: 'Fees and totals',
    short: 'Explains fees',
    does: 'Tallies every charge and bank fee and shows how each total was worked out.',
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
    short: 'Writes emails',
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
    short: 'Cheers you on',
    does: 'Cheers you on, keeps score as you bust ghosts and turns the savings into goals.',
    chips: ['What should I do first?', 'Make my goals', 'Show me the haunted house'],
    intro: (count, total) => `LET'S GO! ${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(total)} on the line. Bust 'em!`,
    pick: (leak) => `${leak.title || leak.merchant}! ${money(leak.amount)} of ${leak.badge.toLowerCase()}. Get it!`,
    room: (label, count, amount) => `${label.toUpperCase()}! ${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(amount)}. Let's clear it!`,
    bust: (leak, left) => `BOOM! ${leak.title || leak.merchant} busted! ${left} left!`,
    done: (total) => `HOUSE CLEARED! ${money(total)} of ghosts, gone! Legend!`,
  },
  cass: {
    name: 'Cassy',
    role: 'the cancel ghost',
    bonus: true, // bonus assistant: looks things up online
    color: '#f2a65a',
    job: 'Helps you cancel',
    short: 'Finds cancel info',
    does: 'Searches the official site for the cancel link, the steps and the phone number, then drafts the email.',
    chips: ['How do I cancel my biggest one?', 'Find a phone number', 'Write my cancel email'],
    intro: (count, total) => `${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(total)}. Name one and I'll find how to cancel it.`,
    pick: (leak) => `${leak.title || leak.merchant}? I'll find their cancel page and phone number.`,
    room: (label, count, amount) => `${label}: ${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(amount)}. Pick one and I'll look it up.`,
    bust: (leak, left) => `${leak.title || leak.merchant}, cancelled. ${left} to go.`,
    done: (total) => `Every one cancelled. ${money(total)} saved. My work here is done.`,
  },
  // Pack 9 part 5: Mo, the Money mind ghost. Explains the common money pattern behind each
  // ghost and one small habit to beat it. Numbers only from the app's maths.
  mind: {
    name: 'Mo',
    role: 'the money mind ghost',
    color: '#c4f06c',
    job: 'Why ghosts happen',
    short: 'Explains patterns',
    does: 'Explains the common money pattern behind each ghost, with the research, and one small habit to beat it.',
    chips: ['Why do my trials turn into charges?', 'Which pattern costs me most?', 'One habit for the biggest one?'],
    intro: (count, total) => `${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(total)}. Most money leaks follow a few common patterns. Want to see which ones are behind yours?`,
    pick: (leak) => `${leak.title || leak.merchant}: ${money(leak.amount)}. There's usually a common pattern behind a ${leak.badge.toLowerCase()}.`,
    room: (label, count, amount) => `${label}: ${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(amount)}. Same pattern, different faces.`,
    bust: (leak, left) => `${leak.title || leak.merchant}, sorted. Noticing is half the work. ${left} to go.`,
    done: (total) => `All ${money(total)} sorted. Notice it, adjust early, no shame.`,
  },
  // Pack 10: Hattie, the habit ghost. Mo explains the pattern; Hattie helps you keep one
  // small habit. (Hank is her "I'm Fine" twin on the Ex theme, on the habit card.)
  habit: {
    name: 'Hattie',
    role: 'the habit ghost',
    color: '#ff8a7a',
    image: '/themes/habit/hattie-main.webp',
    job: 'Make one habit stick',
    short: 'Builds habits',
    does: 'Helps you pick one small money habit from your patterns, puts it in your calendar and checks in a week later.',
    chips: ['Which habit should I start with?', 'Make my habit smaller', 'I keep forgetting, help'],
    intro: (count, total) => `${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(total)}. Mo told you why. I'll help you do one thing about it.`,
    pick: (leak) => `${leak.title || leak.merchant}? Let's make one small habit so it doesn't sneak back.`,
    room: (label, count, amount) => `${label}: ${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(amount)}. One habit can cover all of them.`,
    bust: (leak, left) => `${leak.title || leak.merchant}, gone. That's the habit working. ${left} to go.`,
    done: (total) => `All ${money(total)} sorted. Keep the habit, and they stay gone.`,
  },
};

export const GUIDE_KEYS = Object.keys(GUIDES);
