// The Ghost Fees videos (4 Nov). Files live in public/videos. Where each goes (Claude web's
// pick): the demo walkthrough on home and sign in (new users need to see the app itself);
// the 60-second journey first on /media and at the top of /progress, with the full
// 3-minute journey under it on both.
// seconds: real lengths read from the files.
export const VIDEOS = [
  { key: 'demo', emoji: '🧭', title: 'Demo', line: 'The app from start to finish: upload, every leak, cancel and Ghost It in ASI:One.', src: '/videos/ghost-fees-2-walkthrough.mp4', seconds: 125 },
  { key: 'promo', emoji: '👻', title: 'Promo', line: 'Why your bank statement is haunted and what we do about it.', src: '/videos/ghost-fees-1-promo.mp4', seconds: 92 },
  { key: 'journey', emoji: '📈', title: 'Stranger Builds hackathon feedback', subtitle: 'Ghost Fees in 60 seconds', line: 'What testers and Fetch.ai told us and what we changed, in one minute.', src: '/videos/ghost-fees-journey-60s.mp4', seconds: 58,
    cover: { kicker: 'Stranger Builds · NerdConf · Melbourne', title: 'Hackathon feedback', subtitle: 'Ghost Fees in 60 seconds', tags: ['3 themes', 'Cancel in one click', 'Grouped subscriptions', 'Ghost It agent'] } },
  { key: 'journeyFull', emoji: '🎞️', title: 'The full journey', subtitle: 'Ghost Fees · 3 minutes', line: 'The long version: every round of feedback, the themes and features it shaped, and Ghost It.', src: '/videos/ghost-fees-journey-full.mp4', seconds: 189 },
];

export const PROMO = VIDEOS.find((video) => video.key === 'promo');
export const DEMO = VIDEOS.find((video) => video.key === 'demo');
// Where each one goes (4 Nov): the demo on the home and sign-in pages, because people
// deciding to sign up want to see it working; the promo and how far we've come on
// /progress (the demo leads there too, for judges).
export const LOGIN_VIDEO = DEMO;

export const duration = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
