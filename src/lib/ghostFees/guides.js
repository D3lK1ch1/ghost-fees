import { money } from './format';

// Six ghost guides, each with their own colour and job. They change the tone and
// which questions come first, never the facts.
export const GUIDES = {
  penny: {
    name: 'Penny',
    role: 'the tidy accountant',
    color: '#5ee6c8',
    job: 'Fees and totals',
    short: 'What a fee is',
    does: 'Tallies every charge and bank fee and shows how each total was worked out.',
    hello: "Hi, I'm Penny. My one job: explaining what each fee is.",
    ask: 'Ask Penny about a fee or total',
    chips: ['Which ghost costs the most?', 'How did you work out the total?', 'What is price creep?', 'Why is rent not here?', 'Is my data stored?'],
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
    hello: "Good day, I'm Sir Spooksworth. My one job: writing your emails.",
    ask: 'Ask Sir Spooksworth for a letter',
    chips: ['Write my first email', 'Show all email templates', 'Write a refund email', 'Ask the bank to waive a fee'],
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
    short: 'Your progress',
    does: 'Cheers you on, keeps score as you bust ghosts and turns the savings into goals.',
    hello: "Hey, I'm Gus! My one job: keeping score while you bust ghosts.",
    ask: 'Ask Gus for a plan',
    chips: ['What should I do first?', 'Make my goals', 'Set up reminders', 'Show me the haunted house'],
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
    short: 'How to cancel',
    does: 'Searches the official site for the cancel link, the steps and the phone number, then drafts the email.',
    hello: "I'm Cassy. My one job: showing you how to cancel.",
    ask: 'Name a subscription to cancel',
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
    short: 'Why it happened',
    does: 'Explains the common money pattern behind each ghost, with the research, and one small habit to beat it.',
    hello: "I'm Mo. My one job: explaining why ghosts happen.",
    ask: 'Ask Mo why it happened',
    chips: ['What is a money pattern?', 'Which pattern costs me most?', 'Why do my trials turn into charges?', 'One habit for the biggest one?'],
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
    short: 'One habit',
    does: 'Helps you pick one small money habit from your patterns, puts it in your calendar and checks in a week later.',
    hello: "I'm Hattie. My one job: one small habit that keeps ghosts away.",
    ask: 'Ask Hattie about a habit',
    chips: ['Which habit should I start with?', 'Make my habit smaller', 'I keep forgetting, help', 'Open my habit plan'],
    intro: (count, total) => `${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(total)}. Mo told you why. I'll help you do one thing about it.`,
    pick: (leak) => `${leak.title || leak.merchant}? Let's make one small habit so it doesn't sneak back.`,
    room: (label, count, amount) => `${label}: ${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(amount)}. One habit can cover all of them.`,
    bust: (leak, left) => `${leak.title || leak.merchant}, gone. That's the habit working. ${left} to go.`,
    done: (total) => `All ${money(total)} sorted. Keep the habit, and they stay gone.`,
  },
};

export const GUIDE_KEYS = Object.keys(GUIDES);

// The chat picker shows two labelled rows so Mo and Hattie read as their own team:
// the fee ghosts sort the charges, the habit ghosts stop them coming back.
export const GUIDE_GROUPS = [
  { label: 'Your fees', keys: ['penny', 'sir', 'gus', 'cass'] },
  { label: 'Your habits', keys: ['mind', 'habit'] },
];
