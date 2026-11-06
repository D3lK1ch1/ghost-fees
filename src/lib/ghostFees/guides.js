import { money } from './format';

// Seven ghost guides, each with their own colour and job. They change the tone and
// which questions come first, never the facts.
export const GUIDES = {
  penny: {
    name: 'Penny',
    role: 'the tidy accountant',
    color: '#5ee6c8',
    job: 'Decodes your fees',
    short: 'Fee detective',
    does: 'The fee detective: for every fee, why you pay it, how to stop it and whether you can get it back, with the waiver letter one tap away.',
    hello: "Hi, I'm Penny, the fee detective. My one job: telling you what your statement can't. Why you pay each fee, how to stop it, and whether you can get it back.",
    ask: 'Ask Penny about a fee or total',
    how: ['I find every fee on your statement: bank fees, late fees, surcharges and interest.', 'For each one I tell you why you pay it, how to stop it, and whether you can get it back.', 'One tap gets Spooksworth\'s waiver letter, and I remind you to check your next statement.'],
    chips: ['Why do I pay these fees?', 'Can I get my fees back?', 'How did you work out the total?'],
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
    hello: "Good day. Sir Spooksworth, at your service. My one job: writing your letters, polite but firm.",
    ask: 'Ask Sir Spooksworth for a letter',
    how: ['I draft every letter you need: cancel, refund and fee-waiver emails, with your dates and amounts. No picking.', 'Tap Send in Outlook or Gmail and it opens ready to send from your own email.', 'I put a reminder in your calendar to check for a reply, and tick each step off your task list.'],
    chips: ['Write my first email', 'Write a refund email', 'Ask the bank to waive a fee'],
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
    job: 'Your bust coach',
    short: 'Bust coach',
    does: 'Your bust coach: lines up your ghosts, shows how to bust each one, sends you to the right teammate and keeps score.',
    hello: "LET'S GO! I'm Gus. My one job: keeping score while you bust ghosts.",
    ask: 'Ask Gus for a plan',
    how: ['I line up your ghosts, biggest first, with how to bust each one.', 'Each one has the button that busts it and the teammate who helps: Cassy for cancel pages, Spooksworth for emails, Penny for fees, Kit for doubles.', 'Hit Busted it and your score goes up, on the same task list as your goal path.'],
    chips: ['What do I bust first?', 'Show my score', 'Who helps with what?'],
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
    hello: "I'm Cassy, calm and practical. My one job: showing you exactly how to cancel.",
    ask: 'Name a subscription to cancel',
    how: ['Name a subscription.', 'I give the official cancel page and steps (checked ones only, never guessed).', 'No checked page? I search their official site for it and the phone number.'],
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
    image: '/themes/mind/mo-lantern.webp', // the lantern ghost: he shines a light on why
    job: 'Why ghosts happen',
    short: 'Why it happened',
    does: 'Explains the common money pattern behind each ghost, with the research, and one small habit to beat it.',
    hello: "I'm Mo. I've seen this a hundred times. My one job: explaining why ghosts happen.",
    ask: 'Ask Mo why it happened',
    how: ['I match each ghost to a common money pattern from research.', 'I show you the paper behind it.', 'You say if it sounds like you, and Hattie turns it into one small habit.'],
    chips: ['Which pattern costs me most?', 'Why do my trials turn into charges?', 'What is a money pattern?'],
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
    hello: "I'm Hattie. Small and boring beats big and forgotten. My one job: one habit that keeps ghosts away.",
    ask: 'Ask Hattie about a habit',
    how: ['You pick one small habit from your patterns.', 'Choose a start day and it goes in your calendar.', 'I check in a week later. Two yeses earns the Habit Keeper badge.'],
    chips: ['Which habit should I start with?', 'I keep forgetting, help', 'Open my habit plan'],
    intro: (count, total) => `${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(total)}. Mo told you why. I'll help you do one thing about it.`,
    pick: (leak) => `${leak.title || leak.merchant}? Let's make one small habit so it doesn't sneak back.`,
    room: (label, count, amount) => `${label}: ${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(amount)}. One habit can cover all of them.`,
    bust: (leak, left) => `${leak.title || leak.merchant}, gone. That's the habit working. ${left} to go.`,
    done: (total) => `All ${money(total)} sorted. Keep the habit, and they stay gone.`,
  },
  // Kit, the bundle ghost (6 Nov): two or three of the same thing? Keep one, rotate the
  // rest, or sort your AI tools by what you use them for and your budget. Rules only.
  bundle: {
    name: 'Kit',
    role: 'the bundle ghost',
    color: '#7fd1ff',
    job: 'Researches and optimises your subscriptions',
    short: 'Optimises subs',
    does: 'Researches and optimises your subscriptions: finds double-ups across every Ghost Pack, checks where your shows stream, compares cost against what you use, then helps you keep one, rotate or cancel.',
    hello: "I'm Kit. My one job: researching and optimising your subscriptions, so you keep what you use and rotate the rest.",
    ask: 'Ask Kit, or type your AI tools and prices',
    how: ['I find double-ups across every Ghost Pack: streaming, music, storage, AI tools, food and gaming.', 'I research: tell me what you watch and I check where it streams. For AI tools, tick what you use them for and a budget.', 'I compare cost against what you use, in a cost-benefit table.', "You get a plan: keep one, rotate one a month (in your calendar) or cancel, with Cassy's cancel steps."],
    chips: ['Sort my streaming', 'Sort my AI tools', 'Remind me before renewals'],
    intro: (count, total) => `${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(total)}. Paying for two of the same thing? I'll help you keep one.`,
    pick: (leak) => `${leak.title || leak.merchant}? If you pay for two like it, keep the one you use most.`,
    room: (label, count, amount) => `${label}: ${count} ${count === 1 ? 'ghost' : 'ghosts'}, ${money(amount)}. Doubles hide in here.`,
    bust: (leak, left) => `${leak.title || leak.merchant}, sorted. One of each is plenty. ${left} to go.`,
    done: (total) => `All ${money(total)} sorted. One of each, nothing doubled.`,
  },
};

export const GUIDE_KEYS = Object.keys(GUIDES);

// The chat picker shows two labelled rows: the fee ghosts sort the charges, and the
// plan ghosts (Kit, Mo, Hattie) stop you paying twice and stop ghosts coming back.
export const GUIDE_GROUPS = [
  { label: 'Your fees', keys: ['penny', 'sir', 'gus', 'cass'] },
  { label: 'Your plan', keys: ['bundle', 'mind', 'habit'] },
];
