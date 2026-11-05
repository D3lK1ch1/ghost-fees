// Ghost It, our chat agent on Fetch.ai's ASI:One. Its Agentverse profile has a
// "Chat with Agent" button that opens ASI:One already talking to Ghost It, so we
// send people there instead of the ASI:One home page (no hunting for @ghostit).
// 5 Nov: the self-run Ghost It (mailbox). The hosted one held replies ~40 s, past
// ASI:One's ~30 s wait, so it showed nothing; this one replies in seconds with buttons.
export const GHOST_IT_ADDRESS = 'agent1qdaylwvrj073a2hxxjsqvm26k2cpk8sakqypncmy4e2eewn7t2wwy23w2t0';
// 5 Nov: who copied messages are addressed to. ASI:One still sends "@ghostit" to the old
// (stopped) agent until its index refreshes, so mention the working agent by address.
// When @ghostit reaches Ghost.it again, change this one line back to '@ghostit'.
export const GHOST_IT_MENTION = `@${GHOST_IT_ADDRESS}`;
export const GHOST_IT_PROFILE = `https://agentverse.ai/agents/details/${GHOST_IT_ADDRESS}/profile`;
// Ghost It's own chat page on ASI:One. The "Open Ghost It" buttons go here, so people
// land on Ghost It, not on a blank New Chat with their personal AI (3 Nov).
// Phones: asi1.ai/ai/* is a universal link (asi1.ai/.well-known/apple-app-site-association),
// so it opens the ASI:One mobile app, where outside agents like Ghost It need extra
// verification (Fetch.ai feedback, 4 Nov). /chat stays in the web app, so phones go there
// and paste the copied @ghostit message. Computers keep Ghost It's own page.
export const GHOST_IT_PROFILE_CHAT = `https://asi1.ai/ai/${GHOST_IT_ADDRESS}`;
export const GHOST_IT_WEB_CHAT = 'https://asi1.ai/chat';
const isPhone = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
export const GHOST_IT_CHAT = isPhone ? GHOST_IT_WEB_CHAT : GHOST_IT_PROFILE_CHAT;
export const GHOST_IT_PHONE_NOTE = 'Opens in your browser. The ASI:One phone app only shows Fetch\'s own agents for now.';
export const GHOST_IT_PAGE = 'https://hunt-ghost-fees.base44.app/ghostit';
// A message anyone can try without their own data.
export const GHOST_IT_SAMPLE = `${GHOST_IT_MENTION} netflix $18.99 stan $16 disney+ $15.99 spotify $14.99 gym $25 a week`;
// Ghost It's own mascot, in three poses (transparent, from Image Assets "Ghost It poses"):
// waving with a chat bubble (hello, the default), snipping a credit card (cancelling),
// thumbs up with a tick (done, it stopped).
export const GHOST_IT_MASCOT = '/themes/ghostit/ghost-it-wave.webp';
export const GHOST_IT_SNIP = '/themes/ghostit/ghost-it-snip.webp';
export const GHOST_IT_THUMBS = '/themes/ghostit/ghost-it-thumbs.webp';
// What you get free, then what it costs (paid inside ASI:One with Stripe). Charging is on (3 Nov).
export const GHOST_IT_PRICE = 'Your first Ghost Pack is free. After that, $5 once unlocks every pack. Paid in the chat with Stripe. Never a subscription.';
