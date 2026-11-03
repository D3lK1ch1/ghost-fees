// Ghost It, our chat agent on Fetch.ai's ASI:One. Its Agentverse profile has a
// "Chat with Agent" button that opens ASI:One already talking to Ghost It, so we
// send people there instead of the ASI:One home page (no hunting for @ghostit).
export const GHOST_IT_ADDRESS = 'agent1qvxxy97rjf9axql2xpn7d0rp8g6fxe39v7csh0ha60ud3qqghw9f7t7av43';
export const GHOST_IT_PROFILE = `https://agentverse.ai/agents/details/${GHOST_IT_ADDRESS}/profile`;
// Ghost It's own chat page on ASI:One. The "Open Ghost It" buttons go here, so people
// land on Ghost It, not on a blank New Chat with their personal AI (3 Nov).
export const GHOST_IT_CHAT = `https://asi1.ai/ai/${GHOST_IT_ADDRESS}`;
export const GHOST_IT_PAGE = 'https://hunt-ghost-fees.base44.app/ghostit';
// A message anyone can try without their own data.
export const GHOST_IT_SAMPLE = '@ghostit netflix $18.99 stan $16 disney+ $15.99 spotify $14.99 gym $25 a week';
// Ghost It's own mascot, in three poses (transparent, from Image Assets "Ghost It poses"):
// waving with a chat bubble (hello, the default), snipping a credit card (cancelling),
// thumbs up with a tick (done, it stopped).
export const GHOST_IT_MASCOT = '/themes/ghostit/ghost-it-wave.webp';
export const GHOST_IT_SNIP = '/themes/ghostit/ghost-it-snip.webp';
export const GHOST_IT_THUMBS = '/themes/ghostit/ghost-it-thumbs.webp';
// What you get free, then what it costs (paid inside ASI:One with Stripe). Charging is on (3 Nov).
export const GHOST_IT_PRICE = 'Your first Ghost Pack is free. After that, $5 once unlocks every pack. Paid in the chat with Stripe. Never a subscription.';
