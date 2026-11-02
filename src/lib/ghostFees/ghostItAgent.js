// Ghost It, our chat agent on Fetch.ai's ASI:One. Its Agentverse profile has a
// "Chat with Agent" button that opens ASI:One already talking to Ghost It, so we
// send people there instead of the ASI:One home page (no hunting for @ghostit).
export const GHOST_IT_ADDRESS = 'agent1qvxxy97rjf9axql2xpn7d0rp8g6fxe39v7csh0ha60ud3qqghw9f7t7av43';
export const GHOST_IT_PROFILE = `https://agentverse.ai/agents/details/${GHOST_IT_ADDRESS}/profile`;
export const GHOST_IT_PAGE = 'https://hunt-ghost-fees.base44.app/ghostit';
// A message anyone can try without their own data.
export const GHOST_IT_SAMPLE = '@ghostit netflix $18.99 stan $16 disney+ $15.99 spotify $14.99 gym $25 a week';
// Ghost It's own mascot: a happy ghost cutting up a credit card (from ~/ghost-it).
export const GHOST_IT_MASCOT = '/themes/ghostit/ghost-it.webp';
// What you get free, then what it costs (paid inside ASI:One with Stripe). Free in the beta.
export const GHOST_IT_PRICE = 'Your first Ghost Pack is free. After that, $2 a pack or $5 for every pack, paid once in ASI:One. Free while we’re in beta.';
